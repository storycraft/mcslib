import { Ins } from '.';
import { EndIns } from './end';

export type Node = {
  ins: Ins[],
  end: EndIns,
}

/**
 * create a new empty node with an end or unreachable end
 */
export function emptyNode(
  end: EndIns = { ins: 'unreachable' },
): Node {
  return {
    ins: [],
    end,
  };
}

/**
 * Traverse each nodes from top
 * @param start node to start traverse
 * @param f function to run on each nodes
 */
export function traverseNode(
  start: Node,
  f: (node: Node) => void,
) {
  const stack: Node[] = [start];

  for (let node = stack.pop(); node != null; node = stack.pop()) {
    f(node);

    const end = node.end;
    switch (end.ins) {
      case 'jmp': {
        stack.push(end.next);
        break;
      }

      case 'switch_int': {
        f(node);
        for (const node of end.table) {
          if (node) {
            stack.push(node);
          }
        }
        stack.push(end.default);
        break;
      }

      default: {
        break;
      }
    }
  }
}
