import { ExprIns, Ref } from '@/ir.js';
import { Node, traverseNode } from '@/ir/node.js';

/**
 * Count reference counts of the index.
 * @returns [assignments, references]
 */
export function count(index: number, start: Node): CountResult {
  let assignments = 0;
  let references = 0;
  for (const node of traverseNode(start)) {
    const length = node.ins.length;
    for (let i = 0; i < length; i++) {
      const ins = node.ins[i];
      switch (ins.ins) {
        case 'assign': {
          if (ins.index === index) {
            assignments++;
          }
          references += countReferences(index, ins.expr);
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
          references += 1;
        }

        break;
      }

      default: {
        break;
      }
    }
  }

  return {
    references,
    assignments,
  };
}

export type CountResult = {
  assignments: number,
  references: number,
}

export type Start = {
  node: Node,
  index: number,
}

export function countReferences(index: number, ins: ExprIns): number {
  switch (ins.expr) {
    case 'neg':
    case 'not': {
      return visitRefs(index, ins.operand);
    }

    case 'arith':
    case 'cmp':
    case 'bool': {
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
