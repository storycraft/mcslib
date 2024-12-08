import { FnSig, McsFunction } from '@/fn.js';
import { parseExpr, Term } from './expr/parse.js';
import { lex } from './expr/lex.js';
import { Expr, Call, CommandTemplate, Output, Literal } from '@/ast.js';
import { Span } from '@mcslib/core';
import { FN_SCOPE } from '@/lib.js';

export function mcsExpr(
  arr: TemplateStringsArray,
  ...args: Expr[]
): Expr {
  const span = Span.callSite(1);
  const diagnostics = FN_SCOPE.get().diagnostics;
  const terms: Term[] = [];

  const lexResult = lex(arr[0], span);
  if (lexResult.diagnostics.length > 0) {
    diagnostics.push(...lexResult.diagnostics);
  }

  for (const value of lexResult.tokens) {
    terms.push({ type: 'token', value });
  }

  const length = args.length;
  if (length > 0) {
    for (let i = 0; i < length; i++) {
      terms.push({
        type: 'expr',
        value: args[i],
      });

      const str = arr[i + 1];
      const lexResult = lex(str, span);
      if (lexResult.diagnostics.length > 0) {
        diagnostics.push(...lexResult.diagnostics);
      }

      for (const value of lexResult.tokens) {
        terms.push({ type: 'token', value });
      }
    }
  }

  return parseExpr(terms, span);
}

export function mcsLit(
  value: boolean | number | string
): Literal {
  const span = Span.callSite();

  switch (typeof value) {
    case 'boolean': {
      return {
        kind: 'literal',
        span,
        type: 'number',
        value: 1,
      };
    }

    case 'number': {
      return {
        kind: 'literal',
        span,
        type: 'number',
        value: value,
      };
    }

    case 'string': {
      return {
        kind: 'literal',
        span,
        type: 'string',
        value,
      };
    }
  }
}

export function mcsOutput(template: CommandTemplate): Output {
  return {
    kind: 'output',
    span: Span.callSite(),
    template,
  };
}

export function mcsCall<const Sig extends FnSig>(
  fn: McsFunction<Sig>,
  args: Call<Sig>['args'],
): Call<Sig> {
  return {
    kind: 'call',
    span: Span.callSite(1),
    fn,
    args,
  }
}
