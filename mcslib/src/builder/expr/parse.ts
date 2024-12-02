import { Expr, Unary } from '@/ast.js';
import { Token } from './lex.js';
import { Span } from '@/span.js';
import { diagnostic, Diagnostic } from '@/diagnostic.js';

type Variant<T, V> = {
  ty: T,
  value: V,
}

export type Term = Variant<'expr', Expr> | Variant<'token', Token>;

type ParseCx = {
  span: Span,
  terms: Term[],
  index: number,
}

type Result = {
  result: 'ok',
  expr: Expr,
} | {
  result: 'err',
  diagnostic: Diagnostic,
};

export function parseExpr(
  terms: Term[],
  span: Span,
): Result {
  try {
    return {
      result: 'ok',
      expr: parseCondition({
        span,
        terms,
        index: 0,
      }),
    };
  } catch (e) {
    if (e instanceof ParseError) {
      return {
        result: 'err',
        diagnostic: diagnostic('error', e.message, span),
      };
    }

    throw e;
  }
}

class ParseError {
  constructor(
    public readonly message: string,
  ) { }
}

function expectStringTokenVal(cx: ParseCx, val: string) {
  const token = expectToken(cx);
  if (token.kind !== 'string') {
    throw new ParseError(`expected string token '${val}', got ${token.kind} kind at index: ${cx.index}`);
  }

  if (token.value !== val) {
    throw new ParseError(`expected string token ${val}, got value '${token.value}' at index: ${cx.index}`);
  }
}

function expectToken(cx: ParseCx): Token {
  const term = cx.terms.at(cx.index);
  if (term == null) {
    throw new ParseError(
      `unexpected end of parse buffer. expected a token`,
    );
  }

  if (term.ty !== 'token') {
    throw new ParseError(
      `expected a token, got ${term.ty}. index: ${cx.index}`,
    );
  }

  cx.index++;
  return term.value;
}

function peekToken(cx: ParseCx): Token | null {
  const term = cx.terms.at(cx.index);
  if (term?.ty !== 'token') {
    return null;
  }

  return term.value;
}

function peekStringToken(cx: ParseCx): string | null {
  const token = peekToken(cx);
  if (token?.kind !== 'string') {
    return null;
  }

  return token.value;
}

function parseCondition(cx: ParseCx): Expr {
  const left = parseEquation(cx);

  const term = cx.terms.at(cx.index);
  if (term?.ty !== 'token') {
    return left;
  }

  const op = term.value.value;
  if (op !== '&&' && op !== '||') {
    return left;
  }
  cx.index++;

  return {
    kind: 'binary',
    span: cx.span,
    left,
    op,
    right: parseCondition(cx),
  };
}

function parseEquation(cx: ParseCx): Expr {
  const left = parsePolynomial(cx);

  const op = peekStringToken(cx);
  if (
    op === '=='
    || op === '!='
    || op === '>='
    || op === '<='
    || op === '>'
    || op === '<'
  ) {
    cx.index++;
    return {
      kind: 'binary',
      span: cx.span,
      left,
      op,
      right: parseEquation(cx),
    };
  } else {
    return left;
  }
}

function parsePolynomial(cx: ParseCx): Expr {
  const left = parseMonomial(cx);

  const op = peekStringToken(cx);
  if (op !== '+' && op !== '-') {
    return left;
  }
  cx.index++;

  return {
    kind: 'binary',
    span: cx.span,
    left,
    op,
    right: parsePolynomial(cx),
  };
}

function parseMonomial(cx: ParseCx): Expr {
  const left = parseFactor(cx);

  const op = peekStringToken(cx);
  if (op !== '*' && op !== '/' && op !== '%') {
    return left;
  }
  cx.index++;

  return {
    kind: 'binary',
    span: cx.span,
    left,
    op,
    right: parseMonomial(cx),
  };
}

function parseFactor(cx: ParseCx): Expr {
  const str = peekStringToken(cx);
  if (str === '(') {
    return parseParen(cx);
  } else if (str === '!') {
    return parseNot(cx);
  } else if (str === '-') {
    return parseNeg(cx);
  }

  return parseTerm(cx);
}

function parseParen(cx: ParseCx): Expr {
  expectStringTokenVal(cx, '(');
  const terms = [];

  const length = cx.terms.length;
  for (; cx.index < length; cx.index++) {
    const str = peekStringToken(cx);
    if (str == ')') {
      cx.index++;
      return parseCondition({
        terms,
        span: cx.span,
        index: 0,
      });
    }

    terms.push(cx.terms[cx.index]);
  }

  throw new ParseError(`unclosed paren at: ${cx.index}`);
}

function parseNot(cx: ParseCx): Unary {
  expectStringTokenVal(cx, '!');
  return {
    kind: 'unary',
    span: cx.span,
    op: '!',
    expr: parseCondition(cx),
  };
}

function parseNeg(cx: ParseCx): Unary {
  expectStringTokenVal(cx, '-');
  return {
    kind: 'unary',
    span: cx.span,
    op: '-',
    expr: parseFactor(cx),
  };
}

function parseTerm(cx: ParseCx): Expr {
  const term = cx.terms.at(cx.index);

  if (!term) {
    throw new ParseError('unexpected end of a parse buffer');
  }

  if (term.ty === 'expr') {
    cx.index++;
    return term.value;
  } else if (term.value.kind === 'number') {
    cx.index++;
    return {
      kind: 'literal',
      span: cx.span,
      value: term.value.value,
    };
  }

  const token = term.value;
  throw new ParseError(`expected an expression, found ${term.ty} ${token.value}. index: ${cx.index}`);
}