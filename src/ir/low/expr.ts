import { Arithmetic, Expr, Neg } from '@/ast/expr.js';
import { Env, newStorage, newStorageInit } from '../low.js';
import { Index, Ref } from '../../ir.js';
import { IrType } from '../types.js';
import { Id, Literal } from '@/ast.js';
import { Call } from '@/ast/fn.js';
import { BoolOperator, Comparison, Not } from '@/ast/expr/condition.js';
import { Node } from '../node.js';

export type TypedRef = [IrType, Ref];

export function visitExpr(env: Env, node: Node, expr: Expr): TypedRef {
  switch (expr.ast) {
    case 'comparison': {
      return visitCmp(env, node, expr);
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
      return visitId(env, expr);
    }
  }
}

function visitCmp(env: Env, node: Node, comp: Comparison): TypedRef {
  const [leftTy, left] = visitExpr(env, node, comp.left);
  const [rightTy, right] = visitExpr(env, node, comp.right);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot compare using ${comp.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    expr: { expr: 'cmp', op: comp.op, left, right },
  });

  return [leftTy, { expr: 'index', index }];
}

function visitBool(env: Env, node: Node, bool: BoolOperator): TypedRef {
  const [leftTy, left] = visitExpr(env, node, bool.left);
  const [rightTy, right] = visitExpr(env, node, bool.right);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot apply ${bool.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    expr: { expr: 'bool', op: bool.op, left, right },
  });

  return [leftTy, { expr: 'index', index }];
}

function visitNot(env: Env, node: Node, not: Not): TypedRef {
  const [ty, ref] = visitExpr(env, node, not.expr);
  if (ty !== 'number') {
    throw new Error(`cannot apply ! on type: ${ty}`);
  }

  const index = newStorage(env, ty);
  node.ins.push({
    ins: 'assign',
    index,
    expr: { expr: 'not', operand: ref },
  })
  return [ty, { expr: 'index', index }];
}

function visitCall(env: Env, node: Node, call: Call): TypedRef {
  const returnTy: IrType = call.fn.sig.returns ?? 'empty';

  if (call.fn.sig.args.length !== call.args.length) {
    throw new Error(`required ${call.fn.sig.args.length} arguments but ${call.args.length} are supplied`);
  }
  const args = new Array<Index>(call.args.length);
  const length = call.args.length;
  for (let i = 0; i < length; i++) {
    const ty = call.fn.sig.args[i];
    args[i] = {
      expr: 'index',
      index: newStorageInit(env, node, ty, call.args[i]),
    };
  }

  const index = newStorage(env, returnTy);
  node.ins.push({
    ins: 'assign',
    index,
    expr: { expr: 'call', args, f: call.fn },
  });
  env.dependencies.add(call.fn);

  return [returnTy, { expr: 'index', index }];
}

function visitArith(env: Env, node: Node, arith: Arithmetic): TypedRef {
  const [leftTy, left] = visitExpr(env, node, arith.left);
  const [rightTy, right] = visitExpr(env, node, arith.right);

  if (leftTy !== rightTy) {
    throw new Error(`incompatible type for arithmetic. left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    expr: { expr: 'arith', op: arith.op, left, right },
  });

  return [leftTy, { expr: 'index', index }];
}

function visitNeg(env: Env, node: Node, neg: Neg): TypedRef {
  const [ty, operand] = visitExpr(env, node, neg.expr);
  if (ty !== 'number') {
    throw new Error(`cannot apply - operator to type: ${ty}`);
  }

  const index = newStorage(env, ty);
  node.ins.push({
    ins: 'assign',
    index,
    expr: {
      expr: 'neg',
      operand,
    },
  });
  return [ty, { expr: 'index', index }];
}

function visitLiteral(env: Env, node: Node, lit: Literal): TypedRef {
  return [
    'number',
    {
      expr: 'const',
      ty: 'number',
      value: lit.value,
    },
  ];
}

function visitId(env: Env, id: Id): TypedRef {
  const [ty, index] = env.varMap.get(id);
  return [
    ty,
    {
      expr: 'index',
      index,
    },
  ];
}