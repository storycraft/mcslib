import { Call, McsFunction } from '@/ast/fn.js';
import { Expr } from '@/ast/expr.js';
import { parseExpr, Term } from './expr/parse.js';
import { VarType } from '@/ast/types.js';

type ExprArg = number | Expr;

export function mcsExpr(
  arr: TemplateStringsArray,
  ...args: [ExprArg, ...ExprArg[]]
): Expr {
  const terms: Term[] = [];
  const length = args.length;
  for (let i = 0; i < length; i++) {
    if (arr[i] !== '') {
      for (const value of arr[i].split(' ')) {
        if (value === '') {
          continue;
        }

        terms.push({
          ty: 'token',
          value,
        });
      }
    }

    const arg = args[i];
    if (typeof arg === 'number') {
      terms.push({
        ty: 'expr',
        value: {
          ast: 'literal',
          value: arg,
        },
      });
    } else {
      terms.push({
        ty: 'expr',
        value: arg,
      });
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
