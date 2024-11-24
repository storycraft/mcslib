import { AstTy, Id, Literal } from '../ast.js';
import { Call } from './fn.js';
import { CompExpr } from './expr/condition.js';

export type Expr = Id | CompExpr | Arithmetic | Neg | Literal | Call;

export type Arithmetic = AstTy<'arithmetic'> & {
  left: Expr,
  op: '+' | '-' | '*' | '/' | '%',
  right: Expr,
}

export type Neg = AstTy<'neg'> & {
  expr: Expr,
}
