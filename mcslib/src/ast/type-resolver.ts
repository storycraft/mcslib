import { Expr, Call, Literal, Id, Binary } from '@/ast.js';
import { VarType } from '@/types.js';
import { ExprVisitor, acceptExpr, acceptStmt } from './visit.js';
import { Fn } from '@/fn.js';

export interface TypeResolver {
  /**
   * Resolve expression type
   * @param expr Expression to resolve
   */
  resolve(expr: Expr): VarType | undefined;
}

/**
 * Create a new {@link TypeResolver} of the function
 * @param f 
 * @returns 
 */
export function newResolver(f: Fn): TypeResolver {
  const vars = new Map<number, VarType>();

  const length = f.sig.args.length;
  for (let i = 0; i < length; i++) {
    vars.set(f.args[i].id, f.sig.args[i]);
  }
  acceptStmt(f.block, {
    visitLocal(stmt) {
      vars.set(stmt.id.id, stmt.ty);
      return true;
    },
  });

  return new ExprResolver(vars);
}

class ExprResolver implements TypeResolver, ExprVisitor {
  private type: VarType | undefined;

  constructor(
    private readonly vars: Map<number, VarType>
  ) { }

  resolve(expr: Expr): VarType | undefined {
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
    this.type = expr.fn.sig.returns;
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
