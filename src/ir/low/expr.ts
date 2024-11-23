import { Arithmetic, Expr, Neg } from '@/ast/expr';
import { Env, newStorageInfer, newStorageInit } from '.';
import { Node, ExprIns, Arith, Index } from '..';
import { IrVarType } from '../types';
import { Id, Literal } from '@/ast';
import { Call } from '@/ast/fn';
import { BoolOperator, Comparison, Not } from '@/ast/expr/condition';

export type TypedExprIns = [IrVarType, ExprIns];

export function visitExpr(env: Env, node: Node, expr: Expr): TypedExprIns {
  switch (expr.ast) {
    case 'comparison': {
      return visitComp(env, node, expr);
    }

    case 'bool': {
      return visitBool(env, node, expr);
    }

    case 'not': {
      return visitNot(env, node, expr);
    }

    case 'call': {
      return visitCall(env, node, expr);
    }

    case 'arithmetic': {
      return visitArith(env, node, expr);
    }

    case 'neg': {
      return visitNeg(env, node, expr);
    }

    case 'literal': {
      return visitLiteral(env, node, expr);
    }

    case 'id': {
      return visitId(env, node, expr);
    }
  }
}

function visitComp(env: Env, node: Node, comp: Comparison): TypedExprIns {
  const [leftTy, leftIndex] = newStorageInfer(env, node, comp.left);
  const [rightTy, rightIndex] = newStorageInfer(env, node, comp.right);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot compare using ${comp.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const left: Index = {
    expr: 'index',
    index: leftIndex,
  };
  const right: Index = {
    expr: 'index',
    index: rightIndex,
  };
  
  switch (comp.op) {
    case '==': {
      return [leftTy, { expr: 'eq', left, right }];
    }

    case '!=': {
      return [leftTy, { expr: 'ne', left, right }];
    }

    case '>': {
      return [leftTy, { expr: 'gt', left, right }];
    }

    case '<': {
      return [leftTy, { expr: 'lt', left, right }];
    }

    case '>=': {
      return [leftTy, { expr: 'goe', left, right }];
    }

    case '<=': {
      return [leftTy, { expr: 'loe', left, right }];
    }
  }
}

function visitBool(env: Env, node: Node, bool: BoolOperator): TypedExprIns {
  const [leftTy, leftIndex] = newStorageInfer(env, node, bool.left);
  const [rightTy, rightIndex] = newStorageInfer(env, node, bool.right);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot apply ${bool.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const left: Index = {
    expr: 'index',
    index: leftIndex,
  };
  const right: Index = {
    expr: 'index',
    index: rightIndex,
  };
  
  switch (bool.op) {
    case '&&': {
      return [leftTy, { expr: 'and', left, right }];
    }

    case '||': {
      return [leftTy, { expr: 'or', left, right }];
    }
  }
}

function visitNot(env: Env, node: Node, not: Not): TypedExprIns {
  const [ty, index] = newStorageInfer(env, node, not.expr);
  if (ty !== 'number') {
    throw new Error(`cannot apply ! on type: ${ty}`);
  }

  return [ty, { expr: 'not', operand: { expr: 'index', index } }];
}

function visitCall(env: Env, node: Node, call: Call): TypedExprIns {
  const returnTy: IrVarType = call.fn.sig.returns ?? 'empty';

  if (call.fn.sig.args.length !== call.args.length) {
    throw new Error(`required ${call.fn.sig.args.length} arguments but ${call.args.length} are supplied`);
  }
  const args: Index[] = new Array(call.args.length);
  const length = call.args.length;
  for (let i = 0; i < length; i++) {
    const ty = call.fn.sig.args[i];
    const [actualTy, index] = newStorageInfer(env, node, call.args[i]);
    if (ty !== actualTy) {
      throw new Error(`incompatible type ${actualTy} on argument: ${i} required: ${ty}`);
    }
    args[i] = {
      expr: 'index',
      index,
    };
  }

  return [returnTy, { expr: 'call', args, f: call.fn }];
}

function visitArith(env: Env, node: Node, arith: Arithmetic): TypedExprIns {
  const [leftTy, leftIndex] = newStorageInfer(env, node, arith.left);
  const [rightTy, rightIndex] = newStorageInfer(env, node, arith.right);

  if (leftTy !== rightTy) {
    throw new Error(`incompatible type for arithmetic. left: ${leftTy} right: ${rightTy}`);
  }

  const left: Index = {
    expr: 'index',
    index: leftIndex,
  };
  const right: Index = {
    expr: 'index',
    index: rightIndex,
  };

  let ins: Arith;
  switch (arith.op) {
    case '+': {
      ins = { expr: 'add', left, right };
      break;
    }

    case '-': {
      ins = { expr: 'sub', left, right };
      break;
    }

    case '*': {
      ins = { expr: 'mul', left, right };
      break;
    }

    case '/': {
      ins = { expr: 'div', left, right };
      break;
    }

    case '%': {
      ins = { expr: 'remi', left, right };
      break;
    }

    default: {
      throw new Error(`unknown arithmetic operator: ${arith.op}`);
    }
  }

  return [leftTy, ins];
}

function visitNeg(env: Env, node: Node, neg: Neg): TypedExprIns {
  const index = newStorageInit(env, node, 'number', neg.expr);
  return [
    'number',
    {
      expr: 'neg',
      operand: {
        expr: 'index',
        index,
      },
    },
  ];
}

function visitLiteral(env: Env, node: Node, lit: Literal): TypedExprIns {
  return [
    'number',
    {
      expr: 'const',
      ty: 'number',
      value: lit.value,
    },
  ];
}

function visitId(env: Env, node: Node, id: Id): TypedExprIns {
  const [ty, index] = env.varMap.get(id);
  return [
    ty,
    {
      expr: 'index',
      index,
    },
  ];
}