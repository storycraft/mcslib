import { Assign, Binary, Call, Expr, Id, If, Local, Return, Stmt, Unary } from '@/ast.js';
import { acceptExpr, acceptStmt, ExprVisitor, StmtVisitor } from '@/ast/visit.js';
import { diagnostic, Diagnostic } from '@/diagnostic.js';
import { Fn } from '@/fn.js';
import { VarType } from '@/types.js';

/**
 * Perform type checking
 * @param f Function to check
 * @returns Type diagnostics
 */
export function checkType(f: Fn): Diagnostic[] {
  const cx: Cx = {
    f,
    messages: [],
    vars: new Map<number, VarType>(),
  };

  const length = f.args.length;
  for (let i = 0; i < length; i++) {
    cx.vars.set(f.args[i].id, f.sig.args[i]);
  }

  new StmtChecker(cx).check(f.block);
  return cx.messages;
}

type Cx = {
  f: Fn,
  messages: Diagnostic[],
  vars: Map<number, VarType>,
}

class StmtChecker implements StmtVisitor {
  constructor(
    private readonly cx: Cx
  ) { }

  check(stmt: Stmt) {
    acceptStmt(stmt, this);
  }

  visitLocal(stmt: Local): boolean {
    this.cx.vars.set(stmt.id.id, stmt.ty);
    return true;
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const ty = new ExprChecker(this.cx).check(stmt.expr);
      if (ty !== this.cx.f.sig.returns) {
        this.cx.messages.push(
          diagnostic(
            'error',
            `invalid return value expected: ${this.cx.f.sig.returns} got: ${ty}`,
            stmt.span
          )
        );
      }
    } else {
      if (this.cx.f.sig.returns !== 'empty') {
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
    const checker = new ExprChecker(this.cx);

    const ty = checker.check(stmt.id);
    const exprTy = checker.check(stmt.expr);

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
    if (new ExprChecker(this.cx).check(stmt.condition) !== 'number') {
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
}

class ExprChecker implements ExprVisitor {
  private ty: VarType = 'empty';
  constructor(
    private readonly cx: Cx
  ) { }

  check(expr: Expr): VarType {
    acceptExpr(expr, this);
    return this.ty;
  }

  visitBinary(expr: Binary): boolean {
    const rightTy = this.check(expr.right);
    const leftTy = this.check(expr.left);

    if (leftTy !== 'number' || rightTy !== 'number') {
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
    const ty = this.check(expr.expr);
    if (ty !== 'number') {
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
      const argTy = expr.fn.sig.args[i];
      const ty = this.check(expr.args[i]);

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

    this.ty = expr.fn.sig.returns;
    return true;
  }

  visitOutput(): boolean {
    this.ty = 'number';
    return true;
  }

  visitLiteral(): boolean {
    this.ty = 'number';
    return true;
  }

  visitId(id: Id): boolean {
    const ty = this.cx.vars.get(id.id);
    if (ty == null) {
      this.cx.messages.push(
        diagnostic(
          'error',
          `unknown variable id: ${id.id}`,
          id.span,
        )
      );
    } else {
      this.ty = ty;
    }

    return true;
  }
}
