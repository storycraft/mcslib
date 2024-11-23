import { EndIns } from './end';
import { McsFunction } from '@/ast/fn';
import { IrVarType } from './types';
import { VarType } from '@/ast/types';

/**
 * create a new empty node with an end or unreachable end
 */
export function emptyNode(
  end: EndIns = { ins: 'unreachable' },
): Node {
  return {
    ins: [],
    end,
  };
}

export type IrFunction = {
  storages: Storage[],
  node: Node,
}

export type Storage = {
  ty: IrVarType,
}

export type Node = {
  ins: Ins[],
  end: EndIns,
}

export type InsTy<T extends string> = {
  ins: T,
}

export type Ins = RunCmd | Set;

export type Set = InsTy<'set'> & {
  index: number,
  expr: ExprIns,
}

export type RunCmd = InsTy<'cmd'> & {
  command: string,
}

export type ExprIns = Const | Arith | Call | Neg;

export type ExprInsTy<T extends string> = {
  expr: T,
}

type ArithBody = {
  left: Ref,
  right: Ref,
};

export type Arith = Add | Sub | Mul | Div | Remi;

export type Add = ExprInsTy<'add'> & ArithBody;
export type Sub = ExprInsTy<'sub'> & ArithBody;
export type Mul = ExprInsTy<'mul'> & ArithBody;
export type Div = ExprInsTy<'div'> & ArithBody;
export type Remi = ExprInsTy<'remi'> & ArithBody;

export type Neg = ExprInsTy<'neg'> & {
  target: Ref,
};

export type Call = ExprInsTy<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Ref = Const | Index;

export type Const = ExprInsTy<'const'> & {
  ty: VarType,
  value: number,
}

export type Index = ExprInsTy<'index'> & {
  index: number,
}
