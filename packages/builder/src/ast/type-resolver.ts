import { Expr, Call, Literal, Id, Binary } from '@/ast.js';
import { AstType } from '@/ast/type.js';
import { ExprVisitor, acceptExpr, acceptStmt } from './visit.js';
import { Fn } from '@/fn.js';

export interface TypeResolver {
  /**
   * Resolve expression type
   * @param expr Expression to resolve
   */
  resolve(expr: Expr): AstType | undefined;
}

/**
 * Create a new {@link TypeResolver} of the function
 * @param f 
 * @returns 
 */
export function newResolver(f: Fn): TypeResolver {
  const vars = new Map<number, AstType>();

  const length = f.sig.args.length;
  for (let i = 0; i < length; i++) {
    vars.set(f.args[i].id, f.sig.args[i].type);
  }
  acceptStmt(f.block, {
    visitLocal(stmt) {
      vars.set(stmt.id.id, stmt.type);
      return true;
    },
  });

  return new ExprResolver(vars);
}

class ExprResolver implements TypeResolver, ExprVisitor {
  private type: AstType | undefined;

  constructor(
    private readonly vars: Map<number, AstType>
  ) { }

  resolve(expr: Expr): AstType | undefined {
    acceptExpr(expr, this);
    return this.type;
  }

  visitBinary(expr: Binary): boolean {
    const left = this.resolve(expr.left);
    const right = this.resolve(expr.right);

    if (left === 'number' && right === 'number') {
      this.type = 'number';
    } else {
      this.type = 'string';
    }
    return true;
  }

  visitCall(expr: Call): boolean {
    this.type = expr.fn.sig.returns.type;
    return true;
  }

  visitOutput(): boolean {
    this.type = 'number';
    return true;
  }

  visitLiteral(expr: Literal): boolean {
    this.type = expr.type;
    return true;
  }

  visitId(id: Id): boolean {
    this.type = this.vars.get(id.id);

    return true;
  }
}
