import { FnSig, McsFunction } from '@mcslib/builder/fn.js';
import { Node } from './ir/node.js';
import { Span } from '@mcslib/core';
import { McsType } from '@mcslib/builder/var.js';

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

export type Ins = Execute | Assign | Intrinsic;

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

export type Intrinsic = InsTy<'intrinsic'> & {
  name: string,
  macro: boolean,
  args: Ref[],
  out?: Index,
}

export type Rvalue = Ref | Binary | Unary | Call | Output;

type RvalueKind<T extends string> = {
  kind: T,
  span: Span,
}

export type Binary = RvalueKind<'binary'> & {
  op: BinaryOp,
  left: Ref,
  right: Ref,
}
export type BinaryOp =
  'add'
  | 'concat'
  | 'sub'
  | 'mul'
  | 'div'
  | 'rem'
  | 'and'
  | 'or'
  | 'gt'
  | 'lt'
  | 'goe'
  | 'loe'
  | 'eq'
  | 'ne';

export type Unary = RvalueKind<'unary'> & {
  op: UnaryOp,
  operand: Ref,
}
export type UnaryOp = 'neg' | 'not';

export type Call = RvalueKind<'call'> & {
  args: Ref[],
  f: McsFunction,
}

export type Ref = Const | Index;

export type Const = RvalueKind<'const'> & {
  type: McsType,
  value: string,
};

export function newConst(type: McsType, value: string, span: Span): Const {
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
