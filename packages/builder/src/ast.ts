import { FnSig, McsFunction } from './fn.js';
import { Span } from '@mcslib/core';
import { AstType } from './ast/type.js';

/**
 * identifier for ast types
 */
type Ast<T extends string> = {
  kind: T,
  span: Span,
}

export type Stmt = Block | Local | Assign | If | Loop | Continue | Break | Return | ExprStmt | Execute | Intrinsic;

export type Block = Ast<'block'> & {
  stmts: Stmt[],
}

export type Local = Ast<'local'> & {
  id: Id,
  type: AstType,
}

export type Assign = Ast<'assign'> & {
  id: Id,
  expr: Expr,
}

export type Return = Ast<'return'> & {
  expr?: Expr,
}

export type ExprStmt = Ast<'expr'> & {
  expr: Expr,
}

export type Execute = Ast<'execute'> & {
  templates: CommandTemplate[],
}

export type CommandTemplate = CommandPart[];
export type CommandPart = ExprPart | TextPart;
type Part<T extends string> = { part: T };
type ExprPart = Part<'expr'> & { expr: Expr };
type TextPart = Part<'text'> & { text: string };

export type If = Ast<'if'> & {
  condition: Expr,
  block: Block,
  else?: Block,
}

export type Loop = Ast<'loop'> & {
  label?: Label,
  block: Block,
}

export type Label = {
  name: string,
}

export type Continue = Ast<'continue'> & {
  label?: Label,
}

export type Break = Ast<'break'> & {
  label?: Label,
}

export type Intrinsic = Ast<'intrinsic'> & {
  name: string,
  macro: boolean,
  out?: Id,
  args: Expr[],
  arg_types: AstType[],
}

export type Expr = Id | Binary | Unary | Call | Output | Literal;

export type Id = Ast<'id'> & {
  id: number,
}

export type Literal = Ast<'literal'> & (
  LiteralVariant<'number', number>
  | LiteralVariant<'string', string>
);

type LiteralVariant<T extends AstType, V> = {
  type: T,
  value: V,
}

export type Binary = Ast<'binary'> & {
  left: Expr,
  op: '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<=' | '>=' | '<' | '>' | '||' | '&&',
  right: Expr,
}

export type Unary = Ast<'unary'> & {
  op: '-' | '!',
  operand: Expr,
}

export type Call<Sig extends FnSig = FnSig> = Ast<'call'> & {
  fn: McsFunction<Sig>,
  args: Sig extends FnSig<infer Args> ? { [K in keyof Args]: Expr } : never,
}

export type Output = Ast<'output'> & {
  template: CommandTemplate,
}
