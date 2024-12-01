import { Env, newStorage } from '../lowering.js';
import { Binary, Call, Expr, Id, Literal, Unary } from '@/ast.js';
import { acceptExpr, ExprVisitor } from '@/ast/visit.js';
import { Index, Ref } from '@/ir.js';
import { Node } from '@/ir/node.js';

export function lowExpr(env: Env, node: Node, expr: Expr): Ref {
  return new ExprLowVisitor(env, node).low(expr);
}

class ExprLowVisitor implements ExprVisitor {
  private ref: Ref = { kind: 'const', value: null };

  constructor(
    private readonly env: Env,
    private readonly node: Node,
  ) { }

  low(expr: Expr): Ref {
    acceptExpr(expr, this);
    return this.ref;
  }

  visitBinary(expr: Binary): boolean {
    const right = this.low(expr.right);
    const left = this.low(expr.left);

    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'binary', op: expr.op, left, right },
    });

    this.ref = index;
    return true;
  }

  visitUnary(expr: Unary): boolean {
    const ref = this.low(expr.expr);
    const index = newStorage(this.env);
    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: { kind: 'unary', op: expr.op, operand: ref },
    });
    this.ref = index;
    return true;
  }

  visitCall(expr: Call): boolean {
    const args = new Array<Index>(expr.args.length);
    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const index = newStorage(this.env);
      const rvalue = this.low(expr.args[i]);

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

    this.ref = index;
    return true;
  }

  visitLiteral(expr: Literal): boolean {
    this.ref = {
      kind: 'const',
      value: expr.value,
    };
    return true;
  }

  visitId(expr: Id): boolean {
    this.ref = this.env.varResolver.resolve(expr);
    return true;
  }
}
