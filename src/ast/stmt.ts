import { AstTy, Id } from '.';
import { VarType } from './types';
import { Expr } from './expr';
import { If } from './expr/condition';
import { Loop, Continue, Break } from './loop';

export type Stmt = Local | Assign | If | Loop | Continue | Break | Return | Expr | Command;

export type Local = AstTy<'local'> & {
    id: Id,
    ty: VarType,
    init?: Expr,
}

export type Assign = AstTy<'assign'> & {
    id: Id,
    expr: Expr,
}

export type Return = AstTy<'return'> & {
    expr: Expr,
}

export type Command = AstTy<'command'> & {
    command: string,
}
