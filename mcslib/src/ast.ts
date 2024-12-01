import { FnSig, McsFunction } from './fn.js';
import { VarType } from './types.js'

/**
 * identifier for ast types
 */
type AstKind<T extends string> = {
  kind: T,
}

export type Stmt = Block | Local | Assign | If | Loop | Continue | Break | Return | ExprStmt | Execute;

export type Block = AstKind<'block'> & {
  stmts: Stmt[],
}

export type Local = AstKind<'local'> & {
  id: Id,
  ty: VarType,
}

export type Assign = AstKind<'assign'> & {
  id: Id,
  expr: Expr,
}

export type Return = AstKind<'return'> & {
  expr?: Expr,
}

export type ExprStmt = AstKind<'expr'> & {
  expr: Expr,
}

export type Execute = AstKind<'execute'> & {
  template: CommandTemplate,
}

export type CommandTemplate = CommandPart[];
export type CommandPart = ExprPart | TextPart;
type PartTy<T extends string> = { ty: T };
type ExprPart = PartTy<'expr'> & { expr: Expr };
type TextPart = PartTy<'text'> & { text: string };

export type If = AstKind<'if'> & {
  condition: Expr,
  block: Block,
  else?: Block,
}

export type Loop = AstKind<'loop'> & {
  label?: Label,
  block: Block,
}

export type Label = {
  name: string,
}

export type Continue = AstKind<'continue'> & {
  label?: Label,
}

export type Break = AstKind<'break'> & {
  label?: Label,
}

export type Expr = Id | Binary | Unary | Literal | Call;

declare const marker: unique symbol;
export type Id<T = VarType> = AstKind<'id'> & {
  id: number,
  [marker]?: T,
}

export type Literal = AstKind<'literal'> & {
  value: number,
}

export type Binary = AstKind<'binary'> & {
  left: Expr,
  op: '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<=' | '>=' | '<' | '>' | '||' | '&&',
  right: Expr,
}

export type Unary = AstKind<'unary'> & {
  op: '-' | '!',
  expr: Expr,
}

export type Call<Sig extends FnSig = FnSig> = AstKind<'call'> & {
  fn: McsFunction<Sig>,
  args: Expr[],
}