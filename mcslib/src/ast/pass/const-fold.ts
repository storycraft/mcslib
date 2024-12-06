import { Assign, Binary, Block, Call, Expr, ExprStmt, Id, If, Literal, Loop, Return, Stmt, Unary } from '@/ast.js';
import { acceptExpr, acceptStmt, ExprVisitor, StmtVisitor } from '@/ast/visit.js';
import { Span } from '@/span.js';

export function fold(block: Block) {
  StmtOptimizer.optimize(block);
}

class StmtOptimizer implements StmtVisitor {
  private readonly propagateMap = new Map<number, Literal>();

  static optimize(stmt: Stmt) {
    new StmtOptimizer().visit(stmt);
  }

  visit(stmt: Stmt) {
    acceptStmt(stmt, this);
  }

  visitAssign(stmt: Assign): boolean {
    const expr = ExprOptimizer.optimize(this.propagateMap, stmt.expr);
    if (expr.kind === 'literal') {
      this.propagateMap.set(stmt.id.id, expr);
      stmt.expr = expr;
    } else {
      this.propagateMap.delete(stmt.id.id);
    }

    return true;
  }

  visitExprStmt(stmt: ExprStmt): boolean {
    const expr = ExprOptimizer.optimize(this.propagateMap, stmt.expr);
    if (expr.kind === 'literal') {
      stmt.expr = expr;
    }

    return true;
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const expr = ExprOptimizer.optimize(this.propagateMap, stmt.expr);
      if (expr.kind === 'literal') {
        stmt.expr = expr;
      }
    }

    return true;
  }

  visitLoop(stmt: Loop): boolean {
    StmtOptimizer.optimize(stmt.block);
    return true;
  }

  visitIf(stmt: If): boolean {
    const expr = ExprOptimizer.optimize(this.propagateMap, stmt.condition);
    if (expr.kind === 'literal') {
      stmt.condition = expr;
    }

    return true;
  }
}

class ExprOptimizer implements ExprVisitor {
  constructor(
    private readonly propagateMap: Map<number, Literal>,
    private output: Expr,
  ) { }

  static optimize(
    propagateMap: Map<number, Literal>,
    expr: Expr,
  ): Expr {
    if (expr.kind === 'literal') {
      return expr;
    }

    return new ExprOptimizer(propagateMap, expr).visit(expr);
  }

  visit(expr: Expr): Expr {
    if (expr.kind === 'literal') {
      return expr;
    }

    acceptExpr(expr, this);
    return this.output;
  }

  visitCall(expr: Call): boolean {
    const length = expr.args.length;
    for (let i = 0; i < length; i++) {
      const optimized = this.visit(expr.args[i]);
      if (optimized.kind === 'literal') {
        expr.args[i] = optimized;
      }
    }
    this.output = expr;

    return true;
  }

  visitBinary(expr: Binary): boolean {
    const left = this.visit(expr.left);
    const right = this.visit(expr.right);

    if (left.kind !== 'literal' || right.kind !== 'literal') {
      expr.left = left;
      expr.right = right;
      this.output = expr;
      return true;
    }

    switch (expr.op) {
      case '+': {
        if (left.type === 'number' && right.type === 'number') {
          this.output = litNumber(expr.span, asNumber(left) + asNumber(right));
        } else {
          this.output = {
            kind: 'literal',
            span: expr.span,
            type: 'string',
            value: `${left.value}${right.value}`,
          }
        }
        break;
      }

      case '-': {
        this.output = litNumber(expr.span, asNumber(left) - asNumber(right));
        break;
      }

      case '*': {
        this.output = litNumber(expr.span, asNumber(left) * asNumber(right));
        break;
      }

      case '/': {
        this.output = litNumber(expr.span, asNumber(left) / asNumber(right));
        break;
      }

      case '%': {
        this.output = litNumber(expr.span, asNumber(left) % asNumber(right));
        break;
      }

      case '<': {
        this.output = litNumber(
          expr.span,
          asNumber(left) < asNumber(right) ? 1 : 0
        );
        break;
      }

      case '<=': {
        this.output = litNumber(
          expr.span,
          asNumber(left) <= asNumber(right) ? 1 : 0
        );
        break;
      }

      case '>': {
        this.output = litNumber(
          expr.span,
          asNumber(left) > asNumber(right) ? 1 : 0
        );
        break;
      }

      case '>=': {
        this.output = litNumber(
          expr.span,
          asNumber(left) >= asNumber(right) ? 1 : 0
        );
        break;
      }

      case '==': {
        this.output = litNumber(
          expr.span,
          left.value == right.value ? 1 : 0
        );
        break;
      }

      case '!=': {
        this.output = litNumber(
          expr.span,
          left.value != right.value ? 1 : 0
        );
        break;
      }

      case '&&': {
        if (testLit(left) && testLit(right)) {
          this.output = litNumber(expr.span, 1);
        } else {
          this.output = litNumber(expr.span, 0);
        }
        break;
      }

      case '||': {
        if (testLit(left) || testLit(right)) {
          this.output = litNumber(expr.span, 1);
        } else {
          this.output = litNumber(expr.span, 0);
        }
        break;
      }
    }

    return true;
  }

  visitUnary(expr: Unary): boolean {
    const operand = this.visit(expr.operand);
    if (operand.kind !== 'literal') {
      expr.operand = operand;
      this.output = expr;
      return true;
    }

    switch (expr.op) {
      case '!': {
        const not = litNumber(expr.span, 0);
        if (!testLit(operand)) {
          not.value = 1;
        }

        this.output = not;
        break;
      }

      case '-': {
        operand.value = -asNumber(operand);
        this.output = operand;
        break;
      }
    }

    return true;
  }

  visitId(expr: Id): boolean {
    const constant = this.propagateMap.get(expr.id);
    if (constant) {
      this.output = constant;
    } else {
      this.output = expr;
    }
    return true;
  }
}

function testLit(lit: Literal): boolean {
  return lit.type !== 'number' || lit.value !== 0;
}

function litNumber(span: Span, value: number): Literal {
  return {
    kind: 'literal',
    span,
    type: 'number',
    value,
  };
}

function asNumber(lit: Literal): number {
  if (lit.type !== 'number') {
    throw new Error('converting non number type to number');
  }

  return lit.value;
}
