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
  args: number[],
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

export type Neg = ExprInsTy<'neg'> & {
  operand: Ref,
};

export type Call = ExprInsTy<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Bool = And | Or | Gt | Lt | Goe | Loe | Eq | NotEq | Not;

export type And = ExprInsTy<'and'> & Operands;
export type Or = ExprInsTy<'or'> & Operands;
export type Gt = ExprInsTy<'gt'> & Operands;
export type Lt = ExprInsTy<'lt'> & Operands;
export type Goe = ExprInsTy<'goe'> & Operands;
export type Loe = ExprInsTy<'loe'> & Operands;
export type Eq = ExprInsTy<'eq'> & Operands;
export type NotEq = ExprInsTy<'ne'> & Operands;
export type Not = ExprInsTy<'not'> & {
  operand: Ref,
};

export type Ref = Const | Index;

export type Const = ExprInsTy<'const'> & {
  ty: VarType,
  value: number,
}

export type Index = ExprInsTy<'index'> & {
  index: number,
}
