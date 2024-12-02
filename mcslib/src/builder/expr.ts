import { FnSig, McsFunction } from '@/fn.js';
import { parseExpr, Term } from './expr/parse.js';
import { lex } from './expr/lex.js';
import { Expr, Call } from '@/ast.js';
import { callSite } from '@/span.js';
import { Diagnostic } from '@/diagnostic.js';

export class ExprError {
  constructor(
    public readonly diagnostics: Diagnostic[],
  ) { }
}

export function mcsExpr(
  arr: TemplateStringsArray,
  ...args: Expr[]
): Expr {
  const diagnostics: Diagnostic[] = [];
  const terms: Term[] = [];
  const span = callSite(1);

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

  if (diagnostics.length > 0) {
    throw new ExprError(diagnostics);
  }

  const res = parseExpr(terms, span);
  if (res.result === 'failed') {
    throw new ExprError([res.diagnostic]);
  } else {
    return res.expr;
  }
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
