import { Block } from '@/ast.js';
import { Span } from './span.js';
import { VarType } from './builder/var.js';

export type Fn<Sig extends FnSig = FnSig> = {
  span: Span,
  args: CallArgs<Sig['args']>,
  sig: Sig,
  block: Block,
}

export type CallArgs<Args extends VarType[]> = [...{ [I in keyof Args]: InstanceType<Args[I]> }];

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
  // prevent from Args being invariance
  readonly buildFn: Sig extends FnSig<infer Args> ? McsBuildFn<Args> : never,
};

export type McsBuildFn<in Args extends VarType[] = VarType[]> = (
  ...args: { [I in keyof Args]: InstanceType<Args[I]> }
) => void;
