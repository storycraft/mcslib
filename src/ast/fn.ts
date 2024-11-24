import { AstTy, Id } from '../ast.js';
import { Expr } from './expr.js';
import { Block } from './stmt.js';
import { VarType } from './types.js';

export type Fn<
  Args extends unknown[] = VarType[],
  Ret = VarType,
> = AstTy<'fn'> & {
  args: Id[],
  sig: FnSig<Args, Ret>,
  block: Block,
}

export type Call<
  Args extends unknown[] = VarType[],
  Ret = VarType,
> = AstTy<'call'> & {
  fn: McsFunction<Args, Ret>,
  args: Expr[],
}

export type FnSig<
  Args = VarType[],
  Ret = VarType,
> = {
  args: Args,
  returns?: Ret,
}

/**
 * Unique identifier for a function
 */
export type McsFunction<
  Args extends unknown[] = VarType[],
  Ret = VarType,
> = {
  sig: FnSig<Args, Ret>,
  buildFn: (...args: [...{[I in keyof Args]: Id<Args[I]>}]) => void,
}
