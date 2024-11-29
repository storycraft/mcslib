import { AstTy, Id } from '../ast.js';
import { VarType } from './types.js';
import { Expr } from './expr.js';
import { If } from './expr/condition.js';
import { Loop, Continue, Break } from './loop.js';

export type Stmt = Block | Local | Assign | If | Loop | Continue | Break | Return | Expr | Execute;

export type Block = AstTy<'block'> & {
  stmts: Stmt[],
}

export type Local = AstTy<'local'> & {
  id: Id,
  ty: VarType,
  init: Expr,
}

export type Assign = AstTy<'assign'> & {
  id: Id,
  expr: Expr,
}

export type Return = AstTy<'return'> & {
  expr?: Expr,
}

export type Execute = AstTy<'execute'> & {
  templates: CommandTemplate[],
}

export type CommandTemplate = CommandPart[];
export type CommandPart = ExprPart | TextPart;
type PartTy<T extends string> = { ty: T };
type ExprPart = PartTy<'expr'> & { expr: Expr };
type TextPart = PartTy<'text'> & { text: string };
