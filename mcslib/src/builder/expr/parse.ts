import { Expr, Unary } from '@/ast.js';
import { Token } from './lex.js';
import { Span } from '@/span.js';
import { BuilderError } from '@/builder.js';

type Variant<T, V> = {
  type: T,
  value: V,
}

export type Term = Variant<'expr', Expr> | Variant<'token', Token>;

type ParseCx = {
  span: Span,
  terms: Term[],
  index: number,
}

export function parseExpr(
  terms: Term[],
  span: Span,
): Expr {
  return parseCondition({
    span,
    terms,
    index: 0,
  });
}

function expectKeywordToken(cx: ParseCx, val: string) {
  const token = expectToken(cx);
  if (token.kind !== 'keyword') {
    throw new BuilderError(
      cx.span,
      `expected keyword '${val}', got ${token.kind} kind at index: ${cx.index}`
    );
  }

  if (token.value !== val) {
    throw new BuilderError(
      cx.span,
      `expected string token ${val}, got value '${token.value}' at index: ${cx.index}`
    );
  }
}

function expectToken(cx: ParseCx): Token {
  const term = cx.terms.at(cx.index);
  if (term == null) {
    throw new BuilderError(
      cx.span, 
      `unexpected end of parse buffer. expected a token`,
    );
  }

  if (term.type !== 'token') {
    throw new BuilderError(
      cx.span, 
      `expected a token, got ${term.type}. index: ${cx.index}`,
    );
  }

  cx.index++;
  return term.value;
}

function peekToken(cx: ParseCx): Token | null {
  const term = cx.terms.at(cx.index);
  if (term?.type !== 'token') {
    return null;
  }

  return term.value;
}

function peekKeyword(cx: ParseCx): string | null {
  const token = peekToken(cx);
  if (token?.kind !== 'keyword') {
    return null;
  }

  return token.value;
}

function parseCondition(cx: ParseCx): Expr {
  const left = parseEquation(cx);

  const term = cx.terms.at(cx.index);
  if (term?.type !== 'token') {
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

  const op = peekKeyword(cx);
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

  const op = peekKeyword(cx);
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

  const op = peekKeyword(cx);
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
  const str = peekKeyword(cx);
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
  expectKeywordToken(cx, '(');
  const terms = [];

  const length = cx.terms.length;
  for (; cx.index < length; cx.index++) {
    const str = peekKeyword(cx);
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

  throw new BuilderError(cx.span, `unclosed paren at: ${cx.index}`);
}

function parseNot(cx: ParseCx): Unary {
  expectKeywordToken(cx, '!');
  return {
    kind: 'unary',
    span: cx.span,
    op: '!',
    expr: parseCondition(cx),
  };
}

function parseNeg(cx: ParseCx): Unary {
  expectKeywordToken(cx, '-');
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
    throw new BuilderError(cx.span, 'unexpected end of a parse buffer');
  }

  if (term.type === 'expr') {
    cx.index++;
    return term.value;
  } else if (term.value.kind === 'number') {
    cx.index++;
    return {
      kind: 'number',
      span: cx.span,
      value: term.value.value,
    };
  }

  const token = term.value;
  throw new BuilderError(
    cx.span,
    `expected an expression, found ${term.type} ${token.value}. index: ${cx.index}`
  );
}