import { Assign, Block, Break, Continue, Execute, If, Local, Loop, Return, Stmt, ExprStmt, Expr, Id, Literal, Arithmetic, Comparison, Bool, Neg, Not, Call } from '@/ast.js';

/**
 * Visitor function for statement ast.
 * 
 * Return true to stop traversing children
 */
export interface StmtVisitor {
  visitBlock?(stmt: Block): boolean;
  visitLocal?(stmt: Local): boolean;
  visitAssign?(stmt: Assign): boolean;
  visitReturn?(stmt: Return): boolean;
  visitExecute?(stmt: Execute): boolean;
  visitIf?(stmt: If): boolean;
  visitLoop?(stmt: Loop): boolean;
  visitContinue?(stmt: Continue): boolean;
  visitBreak?(stmt: Break): boolean;
  visitExprStmt?(stmt: ExprStmt): boolean;
}

export function acceptStmt(stmt: Stmt, v: StmtVisitor) {
  switch (stmt.kind) {
    case 'block': {
      if (!v.visitBlock?.(stmt)) {
        for (const child of stmt.stmts) {
          acceptStmt(child, v);
        }
      }
      break;
    }

    case 'local': {
      v.visitLocal?.(stmt);
      break;
    }

    case 'assign': {
      v.visitAssign?.(stmt);
      break;
    }

    case 'return': {
      v.visitReturn?.(stmt);
      break;
    }

    case 'execute': {
      v.visitExecute?.(stmt);
      break;
    }

    case 'if': {
      v.visitIf?.(stmt);
      break;
    }

    case 'loop': {
      if (!v.visitLoop?.(stmt)) {
        acceptStmt(stmt.block, v);
      }
      break;
    }

    case 'continue': {
      v.visitContinue?.(stmt);
      break;
    }

    case 'break': {
      v.visitBreak?.(stmt);
      break;
    }

    case 'expr': {
      v.visitExprStmt?.(stmt);
      break;
    }
  }
}

/**
 * Visitor function for expression ast.
 * 
 * Return true to stop traversing children
 */
export interface ExprVisitor {
  visitId?(expr: Id): boolean,
  visitLiteral?(expr: Literal): boolean,
  visitArithmetic?(expr: Arithmetic): boolean,
  visitComparison?(expr: Comparison): boolean,
  visitBool?(expr: Bool): boolean,
  visitNeg?(expr: Neg): boolean,
  visitNot?(expr: Not): boolean,
  visitCall?(expr: Call): boolean,
}

export function acceptExpr(expr: Expr, v: ExprVisitor) {
  switch (expr.kind) {
    case 'id': {
      v.visitId?.(expr);
      break;
    }
    case 'literal': {
      v.visitLiteral?.(expr);
      break;
    }

    case 'arithmetic': {
      if (!v.visitArithmetic?.(expr)) {
        acceptExpr(expr.left, v);
        acceptExpr(expr.right, v);
      }
      break;
    }

    case 'comparison': {
      if (!v.visitComparison?.(expr)) {
        acceptExpr(expr.left, v);
        acceptExpr(expr.right, v);
      }
      break;
    }

    case 'bool': {
      if (!v.visitBool?.(expr)) {
        acceptExpr(expr.left, v);
        acceptExpr(expr.right, v);
      }
      break;
    }

    case 'neg': {
      if (!v.visitNeg?.(expr)) {
        acceptExpr(expr.expr, v);
      }
      break;
    }

    case 'not': {
      if (!v.visitNot?.(expr)) {
        acceptExpr(expr.expr, v);
      }
      break;
    }

    case 'call': {
      if (!v.visitCall?.(expr)) {
        for (const arg of expr.args) {
          acceptExpr(arg, v);
        }
      }
      break;
    }
  }
}