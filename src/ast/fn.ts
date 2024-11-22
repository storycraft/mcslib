import { AstTy, Block, Id } from '.';
import { Expr } from './expr';
import { VarType } from './types';

export type Fn<
  Args extends unknown[] = VarType[],
  Ret = VarType,
> = AstTy<'fn'> & {
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
  Args,
  Ret,
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
