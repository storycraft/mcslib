import { FnSig, McsFunction } from '@/fn.js';
import { Node } from './ir/node.js';
import { Primitive } from './types.js';
import { Span } from './span.js';

export type IrFunction = {
  sig: FnSig,
  locals: number,
  node: Node,
  dependencies: Set<McsFunction>,
}

export type InsTy<T extends string> = {
  ins: T,
  span: Span,
}

export type Ins = Execute | Assign;

export type Assign = InsTy<'assign'> & {
  index: Index,
  rvalue: Rvalue,
}

export type Execute = InsTy<'execute'> & {
  templates: ExecuteTemplate[],
}

export type ExecuteTemplate = ExecutePart[];
export type ExecutePart = ExecuteTextPart | ExecuteRef;
type ExecutePartTy<T extends string> = { ty: T };
type ExecuteTextPart = ExecutePartTy<'text'> & { text: string };
type ExecuteRef = ExecutePartTy<'ref'> & { ref: Ref };

export type Rvalue = Ref | Call | Binary | Unary | Output | Data;

type RvalueKind<T extends string> = {
  kind: T,
  span: Span,
}

export type Binary = RvalueKind<'binary'> & {
  op: '+' | '-' | '*' | '/' | '%' | '&&' | '||' | '>' | '<' | '>=' | '<=' | '==' | '!=',
  left: Ref,
  right: Ref,
};

export type Unary = RvalueKind<'unary'> & {
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

export function newConst(value: Primitive, span: Span): Const {
  return {
    kind: 'const',
    span,
    value,
  };
}

export type Origin = 'local' | 'argument';

export type Index = RvalueKind<'index'> & {
  origin: Origin,
  index: number,
}

export type Output = RvalueKind<'output'> & {
  template: ExecuteTemplate,
}

export type Data = RvalueKind<'data'> & {
  rest: ExecuteTemplate,
}
