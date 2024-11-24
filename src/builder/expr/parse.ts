import { Expr, Neg } from '@/ast/expr.js';
import { Not } from '@/ast/expr/condition.js';

export type Variant<T, V> = {
  ty: T,
  value: V,
}

export type Term = Variant<'expr', Expr> | Variant<'token', string>;

export type ParseCx = {
  terms: Term[],
  index: number,
}

export function parseExpr(cx: ParseCx): Expr {
  return parseCondition(cx);
}

function expectTokenVal(cx: ParseCx, literal: string) {
  if (expectToken(cx) !== literal) {
    throw new Error(`expected token '${literal}', got '${cx.terms[cx.index].ty}'.  index: ${cx.index}`);
  }
}

function expectToken(cx: ParseCx): string {
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

function peekToken(cx: ParseCx): string | null {
  const term = cx.terms.at(cx.index);
  if (!term || term.ty !== 'token') {
    return null;
  }

  return term.value;
}

function parseCondition(cx: ParseCx): Expr {
  const left = parseEquation(cx);

  const term = cx.terms.at(cx.index);
  if (term == null || term.ty !== 'token' || term.value !== '&&' && term.value !== '||') {
    return left;
  }
  cx.index++;

  return {
    ast: 'bool',
    left,
    op: term.value,
    right: parseEquation(cx),
  };
}

function parseEquation(cx: ParseCx): Expr {
  const left = parsePolynomial(cx);

  const op = peekToken(cx);
  if (
    !op
    || !(
      op === '=='
      || op === '!='
      || op === '>='
      || op === '<='
      || op === '>'
      || op === '<'
    )
  ) {
    return left;
  }
  cx.index++;

  return {
    ast: 'comparison',
    left,
    op,
    right: parseEquation(cx),
  };
}

function parsePolynomial(cx: ParseCx): Expr {
  const left = parseMonomial(cx);

  const op = peekToken(cx);
  if (
    !op
    || op !== '+' && op !== '-'
  ) {
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

  const op = peekToken(cx);
  if (
    !op
    || op !== '*' && op !== '/' && op !== '%'
  ) {
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
  const token = peekToken(cx);
  if (token === '(') {
    return parseParen(cx);
  } else if (token === '!') {
    return parseNot(cx);
  } else if (token === '-') {
    return parseNeg(cx);
  }

  return parseTerm(cx);
}

function parseParen(cx: ParseCx): Expr {
  expectTokenVal(cx, '(');
  const terms = [];

  const length = cx.terms.length;
  for (; cx.index < length; cx.index++) {
    if (peekToken(cx) == ')') {
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
  expectTokenVal(cx, '!');
  return {
    ast: 'not',
    expr: parseExpr(cx),
  };
}

function parseNeg(cx: ParseCx): Neg {
  expectTokenVal(cx, '-');
  return {
    ast: 'neg',
    expr: parseFactor(cx),
  };
}

function parseTerm(cx: ParseCx): Expr {
  const term = cx.terms.at(cx.index);

  if (!term) {
    throw new Error('unexpected end of a parse buffer. expected an expression');
  }

  if (term.ty === 'expr') {
    cx.index++;
    return term.value;
  }

  throw new Error(`expected an expression, found ${term.ty} ${term.value}. index: ${cx.index}`);
}