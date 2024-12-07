import { Expr, Call } from '@/ast.js';
import { FnSig, McsFunction } from '@/fn.js';
import { callSite } from '@/span.js';
import { McsEmpty } from './primitive.js';
import { VarType } from './var.js';

export type McsMethodBuildFn<
  in Class extends VarType = VarType,
  in Args extends VarType[] = VarType[],
> = (
  this: InstanceType<Class>,
  ...args: { [I in keyof Args]: InstanceType<Args[I]> }
) => void;

export type MethodSig<
  Class extends VarType,
  Args extends VarType[] = VarType[],
  Ret extends VarType = VarType,
> = FnSig<[Class, ...Args], Ret>;

export type McsMethod<
  Class extends VarType = VarType,
  Args extends VarType[] = VarType[],
  Ret extends VarType = VarType,
> = (
  this: InstanceType<Class>,
  ...args: { [K in keyof Args]: Expr }
) => Call<MethodSig<Class, Args, Ret>>;

export function defineMcsMethod<
  const Class extends VarType,
  const Args extends VarType[],
  const Ret extends VarType
>(
  cl: Class,
  args: Args,
  buildFn: McsMethodBuildFn<Class, Args>,
  returns: Ret,
): McsMethod<Class, Args, Ret>;
export function defineMcsMethod<
  const Class extends VarType,
  const Args extends VarType[]
>(
  cl: Class,
  args: Args,
  buildFn: McsMethodBuildFn<Class, Args>,
): McsMethod<Class, Args, typeof McsEmpty>;
export function defineMcsMethod<
  const Class extends VarType,
>(
  cl: Class,
  args: VarType[],
  buildFn: McsMethodBuildFn,
  returns: VarType = McsEmpty,
): McsMethod<Class> {
  const span = callSite(1);

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

  return function (this: InstanceType<VarType>, ...args) {
    return {
      kind: 'call',
      span: callSite(1),
      args: [this, ...args],
      fn,
    };
  };
}