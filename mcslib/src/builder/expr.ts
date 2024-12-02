import { FnSig, McsFunction } from '@/fn.js';
import { parseExpr, Term } from './expr/parse.js';
import { lex } from './expr/lex.js';
import { Expr, Call, CommandTemplate, Output, Data } from '@/ast.js';
import { callSite } from '@/span.js';
import { fnScope } from '@/builder.js';

export function mcsExpr(
  arr: TemplateStringsArray,
  ...args: Expr[]
): Expr {
  const span = callSite(1);
  const diagnostics = fnScope.get().diagnostics;
  const terms: Term[] = [];

  const lexResult = lex(arr[0], span);
  if (lexResult.diagnostics.length > 0) {
    diagnostics.push(...lexResult.diagnostics);
  }

  for (const value of lexResult.tokens) {
    terms.push({ ty: 'token', value });
  }

  const length = args.length;
  if (length > 0) {
    for (let i = 0; i < length; i++) {
      terms.push({
        ty: 'expr',
        value: args[i],
      });

      const str = arr[i + 1];
      const lexResult = lex(str, span);
      if (lexResult.diagnostics.length > 0) {
        diagnostics.push(...lexResult.diagnostics);
      }

      for (const value of lexResult.tokens) {
        terms.push({ ty: 'token', value });
      }
    }
  }

  return parseExpr(terms, span);
}

export function mcsOutput(template: CommandTemplate): Output {
  return {
    kind: 'output',
    span: callSite(),
    template,
  };
}

export function mcsData(rest: CommandTemplate): Data {
  return {
    kind: 'data',
    span: callSite(),
    rest,
  };
}

export function mcsCall<const Sig extends FnSig>(
  fn: McsFunction<Sig>,
  args: Expr[],
): Call<Sig> {
  return {
    kind: 'call',
    span: callSite(1),
    fn,
    args,
  }
}
