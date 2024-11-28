import { AstTy, Id } from '../ast.js';
import { VarType } from './types.js';
import { Expr } from './expr.js';
import { If } from './expr/condition.js';
import { Loop, Continue, Break } from './loop.js';

export type Stmt = Block | Local | Assign | If | Loop | Continue | Break | Return | Expr | Command;

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

export type Command = AstTy<'command'> & {
  command: string,
}
