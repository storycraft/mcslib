import { EndIns } from './end';
import { McsFunction } from '@/ast/fn';
import { IrVarType } from './types';

export type IrFunction = {
  locals: Local[],
  start: Node,
}

export type Local = {
  ty: IrVarType,
}

export type Node = {
  ins: [...Ins[], EndIns],
}

export type InsTy<T extends string> = {
  expr: T,
}

export type Ins = AssignIns;

export type AssignIns = InsTy<'assign'> & {
  index: number,
  expr: ExprIns,
}

export type ExprIns = Const | Arith | Call | Neg;

export type ExprTy<T extends string> = {
  expr: T,
}

type ArithBody = {
  left: Ref,
  right: Ref,
};

export type Arith = Add | Sub | Mul | Div | Remi;

export type Add = ExprTy<'add'> & ArithBody;
export type Sub = ExprTy<'sub'> & ArithBody;
export type Mul = ExprTy<'mul'> & ArithBody;
export type Div = ExprTy<'div'> & ArithBody;
export type Remi = ExprTy<'remi'> & ArithBody;

export type Neg = ExprTy<'neg'> & {
  target: Ref,
};

export type Call = ExprTy<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Ref = Const | Index;

export type Const = ExprTy<'const'> & {
  value: number,
}

export type Index = ExprTy<'index'> & {
  index: number,
}
