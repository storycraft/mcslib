import { Env, newStorage, parseTemplate } from '../lowering.js';
import { Binary, Call, Expr, Id, Number, Output, Unary } from '@/ast.js';
import { acceptExpr, ExprVisitor } from '@/ast/visit.js';
import { Index, Ref } from '@/ir.js';
import { Node } from '@/ir/node.js';
import { unknownSpan } from '@/span.js';

export function lowExpr(env: Env, node: Node, expr: Expr): Ref {
  return new ExprLowVisitor(env, node).low(expr);
}

class ExprLowVisitor implements ExprVisitor {
  private ref: Ref = {
    kind: 'const',
    span: unknownSpan(),
    type: 'empty',
    value: '',
  };

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

    const index = newStorage(this.env, expr.span);
    this.node.ins.push({
      ins: 'assign',
      span: expr.span,
      index,
      rvalue: {
        kind: 'binary',
        span: expr.span,
        op: expr.op,
        left,
        right
      },
    });

    this.ref = index;
    return true;
  }

  visitUnary(expr: Unary): boolean {
    const ref = this.low(expr.expr);
    const index = newStorage(this.env, expr.span);
    this.node.ins.push({
      ins: 'assign',
      span: expr.span,
      index,
      rvalue: {
        kind: 'unary',
        span: expr.span,
        op: expr.op,
        operand: ref
      },
    });
    this.ref = index;
    return true;
  }

  visitCall(expr: Call): boolean {
    const args = new Array<Index>(expr.args.length);
    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const rvalue = this.low(expr.args[i]);
      const index = newStorage(this.env, rvalue.span);

      this.node.ins.push({
        ins: 'assign',
        span: expr.span,
        index,
        rvalue,
      });
      args[i] = index;
    }

    const index = newStorage(this.env, expr.span);
    this.node.ins.push({
      ins: 'assign',
      span: expr.span,
      index,
      rvalue: { kind: 'call', span: expr.span, args, f: expr.fn },
    });
    this.env.dependencies.add(expr.fn);

    this.ref = index;
    return true;
  }

  visitOutput(expr: Output): boolean {
    const index = newStorage(this.env, expr.span);
    this.node.ins.push({
      ins: 'assign',
      span: expr.span,
      index,
      rvalue: {
        kind: 'output',
        span: expr.span,
        template: parseTemplate(this.env, this.node, expr.template)
      },
    });
    this.ref = index;
    return true;
  }

  visitNumber(expr: Number): boolean {
    this.ref = {
      kind: 'const',
      span: expr.span,
      type: 'number',
      value: expr.value,
    };
    return true;
  }

  visitId(expr: Id): boolean {
    this.ref = this.env.varResolver.resolve(expr);
    return true;
  }
}
