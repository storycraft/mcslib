import { McsFunction } from '@/ast/fn.js';
import { IrType } from './ir/types.js';
import { Node } from './ir/node.js';
import { CommandTemplate } from './ast/stmt.js';

export type IrFunction = {
  storage: Storage,
  node: Node,
  dependencies: Set<McsFunction>,
}

export type Storage = {
  arguments: IrType[],
  locals: IrType[],
}

export type InsTy<T extends string> = {
  ins: T,
}

export type Ins = Execute | Assign;

export type Assign = InsTy<'assign'> & {
  index: Index,
  expr: ExprIns,
}

export type Execute = InsTy<'execute'> & {
  templates: ExecuteTemplate[]
}

export type ExecuteTemplate = ExecutePart[];
export type ExecutePart = ExecuteTextPart | ExecuteRef;
type ExecutePartTy<T extends string> = { ty: T };
type ExecuteTextPart = ExecutePartTy<'text'> & { text: string };
type ExecuteRef = ExecutePartTy<'ref'> & { ref: Ref };

export type ExprIns = Ref | Bool | Not | Arith | Cmp | Call | Neg;

export type ExprInsTy<T extends string> = {
  expr: T,
}

type Operands = {
  left: Ref,
  right: Ref,
};

export type Arith = ExprInsTy<'arith'> & Operands & {
  op: '+' | '-' | '*' | '/' | '%'
};

type Operand = {
  operand: Ref,
};

export type Neg = ExprInsTy<'neg'> & Operand;

export type Call = ExprInsTy<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Bool = ExprInsTy<'bool'> & Operands & {
  op: '&&' | '||'
}
export type Not = ExprInsTy<'not'> & Operand;

export type Cmp = ExprInsTy<'cmp'> & Operands & {
  op: '>' | '<' | '>=' | '<=' | '==' | '!='
};

export type Ref = Const | Index;

export type Const = ExprInsTy<'const'>
  & (ConstVariant<'number', number> | ConstVariant<'empty', null>);

type ConstVariant<T extends IrType, V> = {
  ty: T,
  value: V,
}

export type Origin = 'local' | 'argument';

export type Index = ExprInsTy<'index'> & {
  origin: Origin,
  index: number,
}
