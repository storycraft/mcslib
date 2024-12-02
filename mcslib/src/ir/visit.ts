import { Binary, Call, Const, Index, Rvalue, Unary } from '@/ir.js';

/**
 * Visitor interface for Rvalue.
 * 
 * Return true to stop traversing children
 */
export interface RvalueVisitor {
  visitUnary?(rvalue: Unary): boolean;
  visitBinary?(rvalue: Binary): boolean;
  visitCall?(rvalue: Call): boolean;
  visitConst?(rvalue: Const): boolean;
  visitIndex?(rvalue: Index): boolean;
}

export function acceptRvalue(rvalue: Rvalue, v: RvalueVisitor) {
  switch (rvalue.kind) {
    case 'unary': {
      if (!v.visitUnary?.(rvalue)) {
        acceptRvalue(rvalue.operand, v);
      }
      break;
    }

    case 'binary': {
      if (!v.visitBinary?.(rvalue)) {
        acceptRvalue(rvalue.left, v);
        acceptRvalue(rvalue.right, v);
      }
      break;
    }

    case 'call': {
      if (!v.visitCall?.(rvalue)) {
        for (const arg of rvalue.args) {
          acceptRvalue(arg, v);
        }
      }
      break;
    }

    case 'const': {
      v.visitConst?.(rvalue);
      break;
    }

    case 'index': {
      v.visitIndex?.(rvalue);
      break;
    }
  }
}
