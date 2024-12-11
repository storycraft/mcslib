import { Env, parseTemplate, rvalueToRef } from '../lowering.js';
import { Binary, Call, Expr, Id, Literal, Output, Unary } from '@mcslib/builder/ast.js';
import { acceptExpr, ExprVisitor } from '@mcslib/builder/ast/visit.js';
import { BinaryOp, Ref, UnaryOp } from 'mcslib/ir.js';
import { Node } from 'mcslib/ir/node.js';
import { Span } from '@mcslib/core';
import { McsNumber } from '@mcslib/builder/primitive.js';

export function lowExpr(env: Env, node: Node, expr: Expr): Ref {
  return new ExprLowVisitor(env, node).low(expr);
}

class ExprLowVisitor implements ExprVisitor {
  private ref: Ref = {
    kind: 'const',
    span: Span.unknown(),
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

    let op: BinaryOp;
    switch (expr.op) {
      case '+': {
        if (this.env.resolver.resolve(expr) === McsNumber) {
          op = 'add';
        } else {
          op = 'concat';
        }
        break;
      }

      case '-': {
        op = 'sub';
        break;
      }

      case '*': {
        op = 'mul';
        break;
      }

      case '/': {
        op = 'div';
        break;
      }

      case '%': {
        op = 'rem';
        break;
      }

      case '>': {
        op = 'gt';
        break;
      }

      case '<': {
        op = 'lt';
        break;
      }

      case '>=': {
        op = 'goe';
        break;
      }

      case '<=': {
        op = 'loe';
        break;
      }

      case '&&': {
        op = 'and';
        break;
      }

      case '||': {
        op = 'or';
        break;
      }

      case '==': {
        op = 'eq';
        break;
      }

      case '!=': {
        op = 'ne';
        break;
      }
    }

    this.ref = rvalueToRef(this.env, this.node, {
      kind: 'binary',
      span: expr.span,
      op,
      left,
      right
    });
    return true;
  }

  visitUnary(expr: Unary): boolean {
    let op: UnaryOp;
    switch (expr.op) {
      case '-': {
        op = 'neg';
        break;
      }

      case '!': {
        op = 'not';
        break;
      }
    }

    this.ref = rvalueToRef(this.env, this.node, {
      kind: 'unary',
      span: expr.span,
      op,
      operand: this.low(expr.operand),
    });
    return true;
  }

  visitCall(expr: Call): boolean {
    const args = new Array<Ref>(expr.args.length);
    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      args[i] = rvalueToRef(
        this.env,
        this.node,
        this.low(expr.args[i])
      );
    }
    this.env.dependencies.add(expr.fn);

    this.ref = rvalueToRef(
      this.env,
      this.node,
      { kind: 'call', span: expr.span, args, f: expr.fn },
    );
    return true;
  }

  visitOutput(expr: Output): boolean {
    this.ref = rvalueToRef(this.env, this.node, {
      kind: 'output',
      span: expr.span,
      template: parseTemplate(this.env, this.node, expr.template)
    });
    return true;
  }

  visitLiteral(expr: Literal): boolean {
    this.ref = {
      kind: 'const',
      span: expr.span,
      type: expr.type,
      value: expr.value.toString(),
    };
    return true;
  }

  visitId(expr: Id): boolean {
    this.ref = this.env.varMap.get(expr);
    return true;
  }
}
