import { Env, newStorage, TypedRef } from '../lowering.js';
import { Arithmetic, Bool, Call, Comparison, Expr, Id, Literal, Neg, Not } from '@/ast.js';
import { acceptExpr, ExprVisitor } from '@/ast/visit.js';
import { Index } from '@/ir.js';
import { Node } from '@/ir/node.js';

export function lowExpr(env: Env, node: Node, expr: Expr): TypedRef {
  const visitor = new ExprLowVisitor(env, node);
  acceptExpr(expr, visitor);
  return visitor.ref;
}

class ExprLowVisitor implements ExprVisitor {
  public ref: TypedRef = [
    'empty',
    { kind: 'const', value: null }
  ];

  constructor(
    private readonly env: Env,
    private readonly node: Node,
  ) { }

  visit(expr: Expr): TypedRef {
    acceptExpr(expr, this);
    return this.ref;
  }

  visitComparison(expr: Comparison): boolean {
    const [rightTy, right] = this.visit(expr.right);
    const [leftTy, left] = this.visit(expr.left);

    if (leftTy !== 'number' || rightTy !== 'number') {
      throw new Error(`cannot compare using ${expr.op} on type left: ${leftTy} right: ${rightTy}`);
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'binary', op: expr.op, left, right },
    });

    this.ref = [leftTy, index];
    return false;
  }

  visitBool(expr: Bool): boolean {
    const [rightTy, right] = this.visit(expr.right);
    const [leftTy, left] = this.visit(expr.left);

    if (leftTy !== 'number' || rightTy !== 'number') {
      throw new Error(`cannot apply ${expr.op} on type left: ${leftTy} right: ${rightTy}`);
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'binary', op: expr.op, left, right },
    });

    this.ref = [leftTy, index];
    return false;
  }

  visitNot(expr: Not): boolean {
    const [ty, ref] = this.visit(expr.expr);
    if (ty !== 'number') {
      throw new Error(`cannot apply ! on type: ${ty}`);
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'unary', op: '!', operand: ref },
    })
    this.ref = [ty, index];
    return false;
  }

  visitCall(expr: Call): boolean {
    const returnTy = expr.fn.sig.returns;

    if (expr.fn.sig.args.length !== expr.args.length) {
      throw new Error(`required ${expr.fn.sig.args.length} arguments but ${expr.args.length} are supplied`);
    }
    const args = new Array<Index>(expr.args.length);
    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const argTy = expr.fn.sig.args[i];
      const index = newStorage(this.env);
      const [ty, rvalue] = this.visit(expr.args[i]);
      if (ty != argTy) {
        throw new Error(
          `expected type ${argTy} got ${ty} at argument pos: ${i}`
        );
      }

      this.node.ins.push({
        ins: 'assign',
        index,
        rvalue,
      });
      args[i] = index;
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'call', args, f: expr.fn },
    });
    this.env.dependencies.add(expr.fn);

    this.ref = [returnTy, index];
    return false;
  }

  visitArithmetic(expr: Arithmetic): boolean {
    const [rightTy, right] = this.visit(expr.right);
    const [leftTy, left] = this.visit(expr.left);

    if (leftTy !== rightTy) {
      throw new Error(`incompatible type for arithmetic. left: ${leftTy} right: ${rightTy}`);
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'binary', op: expr.op, left, right },
    });

    this.ref = [leftTy, index];
    return false;
  }

  visitNeg(neg: Neg): boolean {
    const [ty, operand] = this.visit(neg.expr);
    if (ty !== 'number') {
      throw new Error(`cannot apply - operator to type: ${ty}`);
    }

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: {
        kind: 'unary',
        op: '-',
        operand,
      },
    });

    this.ref = [ty, index];
    return false;
  }

  visitLiteral(expr: Literal): boolean {
    this.ref = [
      'number',
      {
        kind: 'const',
        value: expr.value,
      },
    ];
    return false;
  }

  visitId(expr: Id): boolean {
    this.ref = this.env.varResolver.resolve(expr);
    return false;
  }
}
