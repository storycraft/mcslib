import { Id, Block } from '@/ast.js';
import { VarType } from './types.js';

export type Fn<Sig extends FnSig = FnSig> = {
  args: Id[],
  sig: Sig,
  block: Block,
}

export type FnSig<
  Args extends VarType[] = VarType[],
  Ret extends VarType = VarType,
> = {
  args: Args,
  returns: Ret,
}

/**
 * Unique identifier for a function
 */
export type McsFunction<Sig extends FnSig = FnSig> = {
  sig: Sig,
  buildFn: McsBuildFn<Sig>,
};

export type McsBuildFn<Sig extends FnSig>
  = Sig extends FnSig<infer Args> ? (...args: [...{ [I in keyof Args]: Id<Args[I]> }]) => void : never;