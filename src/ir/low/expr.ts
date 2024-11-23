import { Expr } from '@/ast/expr';
import { Env } from '.';
import { Node, ExprIns } from '..';
import { IrVarType } from '../types';

export function visitExpr(env: Env, node: Node, expr: Expr): [IrVarType, ExprIns] {
  console.log('returning placeholder for visitExpr');
  return ['number', { expr: 'const', ty: 'number', value: 0 }];
}
