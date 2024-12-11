import { Expr, Call, Block } from './ast.js';
import { Span } from '@mcslib/core';
import { McsType, TypedId } from './var.js';
import { McsEmpty } from './primitive.js';

export type Fn<Sig extends FnSig = FnSig> = {
  span: Span,
  args: CallArgs<Sig['args']>,
  sig: Sig,
  block: Block,
}

export type CallArgs<Args extends McsType[]> = [...{ [I in keyof Args]: TypedId<Args[I]> }];

export type FnSig<
  Args extends McsType[] = McsType[],
  Ret extends McsType = McsType,
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

export type McsBuildFn<in Args extends McsType[] = McsType[]> = (
  ...args: { [I in keyof Args]: TypedId<Args[I]> }
) => void;

export type McsMethodBuildFn<
  in Class extends McsType = McsType,
  in Args extends McsType[] = McsType[],
> = (
  this: TypedId<Class>,
  ...args: { [I in keyof Args]: TypedId<Args[I]> }
) => void;

export type MethodSig<
  Class extends McsType,
  Args extends McsType[] = McsType[],
  Ret extends McsType = McsType,
> = FnSig<[Class, ...Args], Ret>;

export type McsMethod<
  Class extends McsType = McsType,
  Args extends McsType[] = McsType[],
  Ret extends McsType = McsType,
> = (
  this: TypedId<Class>,
  ...args: { [K in keyof Args]: Expr }
) => Call<MethodSig<Class, Args, Ret>>;

export function defineMcsMethod<
  const Class extends McsType,
  const Args extends McsType[],
  const Ret extends McsType
>(
  cl: Class,
  args: Args,
  buildFn: McsMethodBuildFn<Class, Args>,
  returns: Ret,
): McsMethod<Class, Args, Ret>;
export function defineMcsMethod<
  const Class extends McsType,
  const Args extends McsType[]
>(
  cl: Class,
  args: Args,
  buildFn: McsMethodBuildFn<Class, Args>,
): McsMethod<Class, Args, typeof McsEmpty>;
export function defineMcsMethod<
  const Class extends McsType,
>(
  cl: Class,
  args: McsType[],
  buildFn: McsMethodBuildFn,
  returns: McsType = McsEmpty,
): McsMethod<Class> {
  const span = Span.callSite(1);

  const fn: McsFunction<MethodSig<Class>> = {
    span,
    sig: {
      args: [cl, ...args],
      returns,
    },
    buildFn: (self, ...args) => {
      buildFn.call(self, ...args);
    },
  };

  return function (this: TypedId<McsType>, ...args) {
    return {
      kind: 'call',
      span: Span.callSite(1),
      args: [this, ...args],
      fn,
    };
  };
}