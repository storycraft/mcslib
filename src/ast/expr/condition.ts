import { Expr } from '.';
import { AstTy, Block } from '..';

export type If = AstTy<'if'> & {
  condition: Expr,
  block: Block,
  else?: Block,
}

export type CompExpr = Comparison | BoolOperator | Not;

export type Comparison = AstTy<'comparison'> & {
  left: Expr,
  op: '==' | '!=' | '<=' | '>=' | '<' | '>',
  right: Expr,
}

export type BoolOperator = AstTy<'bool'> & {
  left: Expr,
  op: '||' | '&&',
  right: Expr,
}

export type Not = AstTy<'not'> & {
  expr: Expr,
}

