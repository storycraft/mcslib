import { Arithmetic, Assign, Bool, Call, Comparison, Expr, Id, If, Local, Neg, Not, Return, Stmt } from '@/ast.js';
import { acceptExpr, acceptStmt, ExprVisitor, StmtVisitor } from '@/ast/visit.js';
import { Fn } from '@/fn.js';
import { VarType } from '@/types.js';

export type Diagnostics = {
  err: Error,
}

/**
 * Perform type checking
 * @param f Function to check
 * @returns Type diagnostics
 */
export function check(f: Fn): Diagnostics[] {
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
  messages: Diagnostics[],
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
        this.cx.messages.push({
          err: Error(
            `invalid return value expected: ${this.cx.f.sig.returns} got: ${ty}`
          ),
        });
      }
    } else {
      if (this.cx.f.sig.returns !== 'empty') {
        this.cx.messages.push({
          err: Error(
            `cannot return without an expression on ${this.cx.f.sig.returns} return type`
          ),
        });
      }
    }

    return true;
  }

  visitAssign(stmt: Assign): boolean {
    const checker = new ExprChecker(this.cx);

    const ty = checker.check(stmt.id);
    const exprTy = checker.check(stmt.expr);

    if (ty !== exprTy) {
      this.cx.messages.push({
        err: Error(`'${exprTy}' cannot be assigned to '${exprTy}'`)
      });
    }

    return true;
  }

  visitIf(stmt: If): boolean {
    if (new ExprChecker(this.cx).check(stmt.condition) !== 'number') {
      this.cx.messages.push({
        err: Error(`condition must be 'number' type`)
      });
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

  visitComparison(expr: Comparison): boolean {
    const rightTy = this.check(expr.right);
    const leftTy = this.check(expr.left);

    if (leftTy !== 'number' || rightTy !== 'number') {
      this.cx.messages.push({
        err: Error(`cannot compare using ${expr.op} on type left: ${leftTy} right: ${rightTy}`),
      });
    }
    return true;
  }

  visitBool(expr: Bool): boolean {
    const rightTy = this.check(expr.right);
    const leftTy = this.check(expr.left);

    if (leftTy !== 'number' || rightTy !== 'number') {
      this.cx.messages.push({
        err: Error(`cannot apply ${expr.op} on type left: ${leftTy} right: ${rightTy}`),
      });
    }
    return true;
  }

  visitNot(expr: Not): boolean {
    const ty = this.check(expr.expr);
    if (ty !== 'number') {
      this.cx.messages.push({
        err: Error(`cannot apply ! on type: ${ty}`),
      });
    }

    return true;
  }

  visitCall(expr: Call): boolean {
    if (expr.fn.sig.args.length !== expr.args.length) {
      this.cx.messages.push({
        err: Error(`required ${expr.fn.sig.args.length} arguments but ${expr.args.length} are supplied`),
      });
    }

    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const argTy = expr.fn.sig.args[i];
      const ty = this.check(expr.args[i]);

      if (ty != argTy) {
        this.cx.messages.push({
          err: Error(`expected type ${argTy} got ${ty} at argument pos: ${i}`),
        });
      }
    }

    this.ty = expr.fn.sig.returns;
    return true;
  }

  visitArithmetic(expr: Arithmetic): boolean {
    const rightTy = this.check(expr.right);
    const leftTy = this.check(expr.left);

    if (leftTy !== rightTy) {
      this.cx.messages.push({
        err: Error(`incompatible type for arithmetic. left: ${leftTy} right: ${rightTy}`),
      });
    }
    return true;
  }

  visitNeg(neg: Neg): boolean {
    const ty = this.check(neg.expr);
    if (ty !== 'number') {
      this.cx.messages.push({
        err: Error(`cannot apply - operator to type: ${ty}`),
      });
    }

    return true;
  }

  visitLiteral(): boolean {
    this.ty = 'number';
    return true;
  }

  visitId(id: Id): boolean {
    const ty = this.cx.vars.get(id.id);
    if (ty == null) {
      this.cx.messages.push({
        err: Error(`unknown variable id: ${id.id}`),
      });
    } else {
      this.ty = ty;
    }

    return true;
  }
}
