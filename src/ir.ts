import { McsFunction } from '@/ast/fn.js';
import { IrType } from './ir/types.js';
import { Node } from './ir/node.js';

export type IrFunction = {
  storages: Storage[],
  node: Node,
}

export type Origin = 'argument' | 'local';

export type Storage = {
  origin: Origin,
  ty: IrType,
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

export type ExprIns = Ref | Bool | Arith | Call | Neg;

export type ExprInsTy<T extends string> = {
  expr: T,
}

type Operands = {
  left: Ref,
  right: Ref,
};

export type Arith = Add | Sub | Mul | Div | Remi;

export type Add = ExprInsTy<'add'> & Operands;
export type Sub = ExprInsTy<'sub'> & Operands;
export type Mul = ExprInsTy<'mul'> & Operands;
export type Div = ExprInsTy<'div'> & Operands;
export type Remi = ExprInsTy<'remi'> & Operands;

type Operand = {
  operand: Ref,
};

export type Neg = ExprInsTy<'neg'> & Operand;

export type Call = ExprInsTy<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Bool = And | Or | Cmp | Not;

export type And = ExprInsTy<'and'> & Operands;
export type Or = ExprInsTy<'or'> & Operands;
export type Cmp = ExprInsTy<'cmp'> & Operands & {
  op: '>' | '<' | '>=' | '<=' | '==' | '!='
};
export type Not = ExprInsTy<'not'> & Operand;

export type Ref = Const | Index;

export type Const = ExprInsTy<'const'>
  & (ConstVariant<'number', number> | ConstVariant<'empty', null>);

type ConstVariant<T extends IrType, V> = {
  ty: T,
  value: V,
}

export type Index = ExprInsTy<'index'> & {
  index: number,
}
