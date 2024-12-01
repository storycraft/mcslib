import { McsFunction } from '@/fn.js';
import { IrType } from './ir/types.js';
import { Node } from './ir/node.js';

export type IrFunction = {
  storage: FnStorage,
  node: Node,
  dependencies: Set<McsFunction>,
}

export type FnStorage = {
  arguments: IrType[],
  locals: IrType[],
}

export type InsTy<T extends string> = {
  ins: T,
}

export type Ins = Execute | Assign;

export type Assign = InsTy<'assign'> & {
  index: Index,
  rvalue: Rvalue,
}

export type Execute = InsTy<'execute'> & {
  template: ExecuteTemplate
}

export type ExecuteTemplate = ExecutePart[];
export type ExecutePart = ExecuteTextPart | ExecuteRef;
type ExecutePartTy<T extends string> = { ty: T };
type ExecuteTextPart = ExecutePartTy<'text'> & { text: string };
type ExecuteRef = ExecutePartTy<'ref'> & { ref: Ref };

export type Rvalue = Ref | Bool | Not | Arith | Cmp | Call | Neg;

type RvalueKind<T extends string> = {
  kind: T,
}

type Operands = {
  left: Ref,
  right: Ref,
};

export type Arith = RvalueKind<'arith'> & Operands & {
  op: '+' | '-' | '*' | '/' | '%'
};

type Operand = {
  operand: Ref,
};

export type Neg = RvalueKind<'neg'> & Operand;

export type Call = RvalueKind<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Bool = RvalueKind<'bool'> & Operands & {
  op: '&&' | '||'
}
export type Not = RvalueKind<'not'> & Operand;

export type Cmp = RvalueKind<'cmp'> & Operands & {
  op: '>' | '<' | '>=' | '<=' | '==' | '!='
};

export type Ref = Const | Index;

export type Const = RvalueKind<'const'>
  & (ConstVariant<'number', number> | ConstVariant<'empty', null>);

type ConstVariant<T extends IrType, V> = {
  ty: T,
  value: V,
}

export type Origin = 'local' | 'argument';

export type Index = RvalueKind<'index'> & {
  origin: Origin,
  index: number,
}
