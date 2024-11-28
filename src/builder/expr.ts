import { Call, McsFunction } from '@/ast/fn.js';
import { Expr } from '@/ast/expr.js';
import { parseExpr, Term } from './expr/parse.js';
import { VarType } from '@/ast/types.js';
import { lex } from './expr/lex.js';

export function mcsExpr(
  arr: TemplateStringsArray,
  ...args: Expr[]
): Expr {
  const terms: Term[] = [];
  for (const value of lex(arr[0])) {
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
      for (const value of lex(str)) {
        terms.push({ ty: 'token', value });
      }
    }
  }

  return parseExpr({
    terms,
    index: 0,
  });
}

export function mcsCall<
  const Args extends VarType[],
  const Ret extends VarType,
>(
  fn: McsFunction<Args, Ret>,
  args: Expr[],
): Call<Args, Ret> {
  return {
    ast: 'call',
    fn,
    args,
  }
}
