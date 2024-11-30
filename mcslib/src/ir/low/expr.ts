import { Arithmetic, Expr, Neg } from '@/ast/expr.js';
import { Env, newStorage, newStorageInit, TypedRef } from '../low.js';
import { Index } from '../../ir.js';
import { IrType } from '../types.js';
import { Id, Literal } from '@/ast.js';
import { Call } from '@/ast/fn.js';
import { BoolOperator, Comparison, Not } from '@/ast/expr/condition.js';
import { Node } from '../node.js';

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
  const [rightTy, right] = visitExpr(env, node, comp.right);
  const [leftTy, left] = visitExpr(env, node, comp.left);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot compare using ${comp.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    rvalue: { kind: 'cmp', op: comp.op, left, right },
  });

  return [leftTy, index];
}

function visitBool(env: Env, node: Node, bool: BoolOperator): TypedRef {
  const [rightTy, right] = visitExpr(env, node, bool.right);
  const [leftTy, left] = visitExpr(env, node, bool.left);

  if (leftTy !== 'number' || rightTy !== 'number') {
    throw new Error(`cannot apply ${bool.op} on type left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    rvalue: { kind: 'bool', op: bool.op, left, right },
  });

  return [leftTy, index];
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
    rvalue: { kind: 'not', operand: ref },
  })
  return [ty, index];
}

function visitCall(env: Env, node: Node, call: Call): TypedRef {
  const returnTy: IrType = call.fn.sig.returns ?? 'empty';

  if (call.fn.sig.args.length !== call.args.length) {
    throw new Error(`required ${call.fn.sig.args.length} arguments but ${call.args.length} are supplied`);
  }
  const args = new Array<Index>(call.args.length);
  const length = call.args.length;
  for (let i = 0; i < length; i++) {
    args[i] = newStorageInit(
      env,
      node,
      call.fn.sig.args[i],
      call.args[i]
    );
  }

  const index = newStorage(env, returnTy);
  node.ins.push({
    ins: 'assign',
    index,
    rvalue: { kind: 'call', args, f: call.fn },
  });
  env.dependencies.add(call.fn);

  return [returnTy, index];
}

function visitArith(env: Env, node: Node, arith: Arithmetic): TypedRef {
  const [rightTy, right] = visitExpr(env, node, arith.right);
  const [leftTy, left] = visitExpr(env, node, arith.left);

  if (leftTy !== rightTy) {
    throw new Error(`incompatible type for arithmetic. left: ${leftTy} right: ${rightTy}`);
  }

  const index = newStorage(env, leftTy);
  node.ins.push({
    ins: 'assign',
    index,
    rvalue: { kind: 'arith', op: arith.op, left, right },
  });

  return [leftTy, index];
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
    rvalue: {
      kind: 'neg',
      operand,
    },
  });
  return [ty, index];
}

function visitLiteral(env: Env, node: Node, lit: Literal): TypedRef {
  return [
    'number',
    {
      kind: 'const',
      ty: 'number',
      value: lit.value,
    },
  ];
}

function visitId(env: Env, id: Id): TypedRef {
  return env.varResolver.resolve(id);
}
