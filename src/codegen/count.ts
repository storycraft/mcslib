import { ExprIns, Ref } from '@/ir.js';
import { Node, traverseNode } from '@/ir/node.js';

/**
 * Calculate reference counts of the index.
 * Assignments are not included.
 */
export function countReference(index: number, start: Node): number {
  let count = 0;
  for (const node of traverseNode(start)) {
    for (const ins of node.ins) {
      switch (ins.ins) {
        case 'set': {
          count += visitExpr(index, ins.expr);
          break;
        }

        default: {
          break;
        }
      }
    }

    const end = node.end;
    switch (end.ins) {
      case 'switch_int': {
        if (end.index === index) {
          count += 1;
        }

        break;
      }

      default: {
        break;
      }
    }
  }

  return count;
}

function visitExpr(index: number, ins: ExprIns): number {
  switch (ins.expr) {
    case 'neg':
    case 'not': {
      return visitRefs(index, ins.operand);
    }

    case 'and':
    case 'or':
    case 'goe':
    case 'loe':
    case 'gt':
    case 'lt':
    case 'eq':
    case 'ne':
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'remi': {
      return visitRefs(index, ins.left, ins.right);
    }

    case 'call': {
      return visitRefs(index, ...ins.args);
    }

    case 'index': {
      return ins.index === index ? 1 : 0;
    }

    default: {
      return 0;
    }
  }
}

function visitRefs(index: number, ...refs: Ref[]): number {
  return refs.reduce(
    (prev, ref) => {
      if (ref.expr === 'index' && ref.index === index) {
        return prev + 1;
      }

      return prev;
    },
    0
  );
}
