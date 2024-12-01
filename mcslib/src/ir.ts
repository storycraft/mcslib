import { FnSig, McsFunction } from '@/fn.js';
import { Node } from './ir/node.js';
import { Primitive } from './types.js';

export type IrFunction = {
  sig: FnSig,
  locals: number,
  node: Node,
  dependencies: Set<McsFunction>,
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

export type Rvalue = Ref | Call | BinaryOp | UnaryOp;

type RvalueKind<T extends string> = {
  kind: T,
}

export type BinaryOp = RvalueKind<'binary'> & {
  op: '+' | '-' | '*' | '/' | '%' | '&&' | '||' | '>' | '<' | '>=' | '<=' | '==' | '!=',
  left: Ref,
  right: Ref,
};

export type UnaryOp = RvalueKind<'unary'> & {
  op: '-' | '!',
  operand: Ref,
};

export type Call = RvalueKind<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Ref = Const | Index;

export type Const = RvalueKind<'const'> & {
  value: Primitive,
};

export type Origin = 'local' | 'argument';

export type Index = RvalueKind<'index'> & {
  origin: Origin,
  index: number,
}
