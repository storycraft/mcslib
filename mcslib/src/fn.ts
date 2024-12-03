import { Id, Block } from '@/ast.js';
import { VarType } from './types.js';
import { Span } from './span.js';

export type Fn<Sig extends FnSig = FnSig> = {
  span: Span,
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
export interface McsFunction<Sig extends FnSig = FnSig> {
  readonly span: Span,
  readonly sig: Sig,
  readonly buildFn: McsBuildFn<Sig>,
};

export type McsBuildFn<Sig extends FnSig>
  = Sig extends FnSig<infer Args> ? (...args: [...{ [I in keyof Args]: Id<Args[I]> }]) => void : never;