import { AstTy, ConstNumber, Id } from '..';
import { Call } from '../fn';
import { CompExpr } from './condition';

export type Expr = Id | CompExpr | Arithmetic | Neg | ConstNumber | Call;

export type Arithmetic = AstTy<'arithmetic'> & {
    left: Expr,
    op: '+' | '-' | '*' | '/' | '%',
    right: Expr,
}

export type Neg = AstTy<'neg'> & {
    expr: Expr,
}
