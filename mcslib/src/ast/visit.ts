import { Assign, Block, Break, Continue, Execute, If, Local, Loop, Return, Stmt, ExprStmt, Expr, Id, Call, Unary, Binary, Output, Literal } from '@/ast.js';

/**
 * Visitor interface for statement ast.
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
 * Visitor interface for expression ast.
 * 
 * Return true to stop traversing children
 */
export interface ExprVisitor {
  visitId?(expr: Id): boolean;
  visitLiteral?(expr: Literal): boolean;
  visitBinary?(expr: Binary): boolean;
  visitUnary?(expr: Unary): boolean;
  visitCall?(expr: Call): boolean;
  visitOutput?(expr: Output): boolean;
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

    case 'binary': {
      if (!v.visitBinary?.(expr)) {
        acceptExpr(expr.left, v);
        acceptExpr(expr.right, v);
      }
      break;
    }

    case 'unary': {
      if (!v.visitUnary?.(expr)) {
        acceptExpr(expr.operand, v);
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

    case 'output': {
      v.visitOutput?.(expr);
      break;
    }
  }
}
