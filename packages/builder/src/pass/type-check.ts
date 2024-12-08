import { Assign, Binary, Call, Expr, Id, If, Intrinsic, Return, Stmt, Unary } from '@mcslib/builder/ast.js';
import { acceptExpr, acceptStmt, ExprVisitor, StmtVisitor } from '@mcslib/builder/ast/visit.js';
import { diagnostic, Diagnostic } from '@mcslib/core';
import { Fn } from '@mcslib/builder/fn.js';
import { TypeResolver } from '@mcslib/builder/ast/type-resolver.js';
import { AstType } from '@mcslib/builder/ast/type.js';

/**
 * Perform type checking
 * @param f Function to check
 * @returns Type diagnostics
 */
export function checkType(f: Fn, resolver: TypeResolver): Diagnostic[] {
  const cx: Cx = {
    f,
    resolver,
    messages: [],
  };

  new Checker(cx).checkStmt(f.block);
  return cx.messages;
}

type Cx = {
  f: Fn,
  resolver: TypeResolver,
  messages: Diagnostic[],
}

class Checker implements StmtVisitor, ExprVisitor {
  constructor(
    private readonly cx: Cx
  ) { }

  checkStmt(stmt: Stmt) {
    acceptStmt(stmt, this);
  }

  checkExpr(expr: Expr): AstType | undefined {
    acceptExpr(expr, this);
    return this.cx.resolver.resolve(expr);
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const ty = this.checkExpr(stmt.expr);
      if (ty !== this.cx.f.sig.returns.type) {
        this.cx.messages.push(
          diagnostic(
            'error',
            `invalid return value expected: ${this.cx.f.sig.returns} got: ${ty}`,
            stmt.span
          )
        );
      }
    } else {
      if (this.cx.f.sig.returns.type !== 'empty') {
        this.cx.messages.push(
          diagnostic(
            'error',
            `cannot return without an expression on ${this.cx.f.sig.returns} return type`,
            stmt.span
          )
        );
      }
    }

    return true;
  }

  visitAssign(stmt: Assign): boolean {
    const ty = this.checkExpr(stmt.id);
    const exprTy = this.checkExpr(stmt.expr);

    if (ty !== exprTy) {
      this.cx.messages.push(
        diagnostic(
          'error',
          `'${exprTy}' cannot be assigned to '${ty}'`,
          stmt.span,
        )
      );
    }

    return true;
  }

  visitIf(stmt: If): boolean {
    if (this.checkExpr(stmt.condition) !== 'number') {
      this.cx.messages.push(
        diagnostic(
          'error',
          `condition must be 'number' type`,
          stmt.span,
        )
      );
    }

    return true;
  }

  visitIntrinsic(stmt: Intrinsic): boolean {
    const length = stmt.arg_types.length;
    for (let i = 0; i < length; i++) {
      const exprTy = this.checkExpr(stmt.args[i]);
      const expectedTy = stmt.arg_types[i];
      if (this.checkExpr(stmt.args[i]) !== expectedTy) {
        this.cx.messages.push(
          diagnostic(
            'error',
            `expected '${expectedTy}' got '${exprTy}'`,
            stmt.span,
          )
        );
      }
    }
    return true;
  }

  visitBinary(expr: Binary): boolean {
    const rightTy = this.checkExpr(expr.right);
    const leftTy = this.checkExpr(expr.left);

    if (
      (
        expr.op === '-'
        || expr.op === '*'
        || expr.op === '/'
        || expr.op === '%'
      )
      && (leftTy !== 'number' || rightTy !== 'number')
    ) {
      this.cx.messages.push(
        diagnostic(
          'error',
          `cannot apply binary operator '${expr.op}' on type left: ${leftTy} right: ${rightTy}`,
          expr.span,
        )
      );
    }
    return true;
  }

  visitUnary(expr: Unary): boolean {
    const ty = this.checkExpr(expr.operand);
    if (expr.op === '-' && ty !== 'number') {
      this.cx.messages.push(
        diagnostic(
          'error',
          `cannot apply unary operator '${expr.op}' on type: ${ty}`,
          expr.span,
        )
      );
    }

    return true;
  }

  visitCall(expr: Call): boolean {
    if (expr.fn.sig.args.length !== expr.args.length) {
      this.cx.messages.push(
        diagnostic(
          'error',
          `required ${expr.fn.sig.args.length} arguments but ${expr.args.length} are supplied`,
          expr.span,
        )
      );
    }

    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const argTy = expr.fn.sig.args[i].type;
      const ty = this.checkExpr(expr.args[i]);

      if (ty != argTy) {
        this.cx.messages.push(
          diagnostic(
            'error',
            `expected type ${argTy} got ${ty} at argument pos: ${i}`,
            expr.span,
          )
        );
      }
    }

    return true;
  }

  visitId(id: Id): boolean {
    const ty = this.cx.resolver.resolve(id);
    if (ty == null) {
      this.cx.messages.push(
        diagnostic(
          'error',
          `unknown variable id: ${id.id}`,
          id.span,
        )
      );
    }

    return true;
  }
}
