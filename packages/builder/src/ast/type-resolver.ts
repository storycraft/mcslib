import { Expr, Call, Literal, Id, Binary } from '@/ast.js';
import { ExprVisitor, acceptExpr, acceptStmt } from './visit.js';
import { Fn } from '@/fn.js';
import { McsType } from '@/var.js';
import { McsNumber, McsString } from '@/primitive.js';

export interface TypeResolver {
  /**
   * Resolve expression type
   * @param expr Expression to resolve
   */
  resolve(expr: Expr): McsType | undefined;
}

/**
 * Create a new {@link TypeResolver} of the function
 * @param f 
 * @returns 
 */
export function newResolver(f: Fn): TypeResolver {
  const vars = new Map<number, McsType>();

  const length = f.sig.args.length;
  for (let i = 0; i < length; i++) {
    vars.set(f.args[i].id, f.sig.args[i]);
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
  private type: McsType | undefined;

  constructor(
    private readonly vars: Map<number, McsType>
  ) { }

  resolve(expr: Expr): McsType | undefined {
    acceptExpr(expr, this);
    return this.type;
  }

  visitBinary(expr: Binary): boolean {
    const left = this.resolve(expr.left);
    const right = this.resolve(expr.right);

    if (left === McsNumber && right === McsNumber) {
      this.type = McsNumber;
    } else {
      this.type = McsString;
    }
    return true;
  }

  visitCall(expr: Call): boolean {
    this.type = expr.fn.sig.returns;
    return true;
  }

  visitOutput(): boolean {
    this.type = McsNumber;
    return true;
  }

  visitLiteral(expr: Literal): boolean {
    switch (expr.type) {
      case 'number': {
        this.type = McsNumber;
        break;
      }

      case 'string': {
        this.type = McsString;
        break;
      }
    }
    return true;
  }

  visitId(id: Id): boolean {
    this.type = this.vars.get(id.id);

    return true;
  }
}
