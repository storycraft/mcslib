import { FnSig, McsFunction } from './fn.js';
import { Span } from './span.js';
import { VarType } from './types.js'

/**
 * identifier for ast types
 */
type Ast<T extends string> = {
  kind: T,
  span: Span,
}

export type Stmt = Block | Local | Assign | If | Loop | Continue | Break | Return | ExprStmt | Execute;

export type Block = Ast<'block'> & {
  stmts: Stmt[],
}

export type Local = Ast<'local'> & {
  id: Id,
  ty: VarType,
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

export type Expr = Id | Binary | Unary | Call | Output | Literal;

declare const marker: unique symbol;
export type Id<T = VarType> = Ast<'id'> & {
  id: number,
  [marker]?: T,
}

export type Literal = Ast<'literal'> & (
  LiteralVariant<'number', number>
  | LiteralVariant<'string', string>
);

type LiteralVariant<T extends VarType, V> = {
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
  args: Expr[],
}

export type Output = Ast<'output'> & {
  template: CommandTemplate,
}
