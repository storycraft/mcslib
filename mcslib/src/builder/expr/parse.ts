import { Expr, Neg } from '@/ast/expr.js';
import { Not } from '@/ast/expr/condition.js';
import { Token } from './lex.js';

type Variant<T, V> = {
  ty: T,
  value: V,
}

export type Term = Variant<'expr', Expr> | Variant<'token', Token>;

export type ParseCx = {
  terms: Term[],
  index: number,
}

export function parseExpr(cx: ParseCx): Expr {
  return parseCondition(cx);
}

function expectStringTokenVal(cx: ParseCx, val: string) {
  const token = expectToken(cx);
  if (token.kind !== 'string') {
    throw new Error(`expected string token '${val}', got ${token.kind} kind at index: ${cx.index}`);
  }

  if (token.value !== val) {
    throw new Error(`expected string token ${val}, got value '${token.value}' at index: ${cx.index}`);
  }
}

function expectToken(cx: ParseCx): Token {
  const term = cx.terms.at(cx.index);
  if (term == null) {
    throw new Error(`unexpected end of parse buffer. expected a token`);
  }

  if (term.ty !== 'token') {
    throw new Error(`expected a token, got ${term.ty}. index: ${cx.index}`);
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
    ast: 'bool',
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
      ast: 'comparison',
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
    ast: 'arithmetic',
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
    ast: 'arithmetic',
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
      return parseExpr({
        terms,
        index: 0,
      });
    }

    terms.push(cx.terms[cx.index]);
  }

  throw new Error(`unclosed paren at: ${cx.index}`);
}

function parseNot(cx: ParseCx): Not {
  expectStringTokenVal(cx, '!');
  return {
    ast: 'not',
    expr: parseExpr(cx),
  };
}

function parseNeg(cx: ParseCx): Neg {
  expectStringTokenVal(cx, '-');
  return {
    ast: 'neg',
    expr: parseFactor(cx),
  };
}

function parseTerm(cx: ParseCx): Expr {
  const term = cx.terms.at(cx.index);

  if (!term) {
    throw new Error('unexpected end of a parse buffer');
  }

  if (term.ty === 'expr') {
    cx.index++;
    return term.value;
  } else if (term.value.kind === 'number') {
    cx.index++;
    return {
      ast: 'literal',
      value: term.value.value,
    };
  }

  const token = term.value;
  throw new Error(`expected an expression, found ${term.ty} ${token.value}. index: ${cx.index}`);
}