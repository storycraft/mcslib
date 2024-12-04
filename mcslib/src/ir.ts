import { FnSig, McsFunction } from '@/fn.js';
import { Node } from './ir/node.js';
import { VarType } from './types.js';
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
type Part<T extends string> = { part: T };
type ExecuteTextPart = Part<'text'> & { text: string };
type ExecuteRef = Part<'ref'> & { ref: Ref };

export type Rvalue = Ref | Call | Binary | Unary | Output;

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
  type: VarType,
  value: string,
};

export function newConst(type: VarType, value: string, span: Span): Const {
  return {
    kind: 'const',
    span,
    type,
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
