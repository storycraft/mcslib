import { Ins } from '../ir.js';
import { EndIns } from './end.js';

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
 * Traverse node graph from the top
 * @param start node to start traverse
 */
export function *traverseNode(
  start: Node
): Generator<Node, void, void> {
  const stack: Node[] = [start];

  for (let node = stack.pop(); node != null; node = stack.pop()) {
    yield node;

    stack.push(...childrenNodes(node));
  }
}

/**
 * Get next nodes
 * @param node parent node
 */
export function childrenNodes(
  node: Node,
): Node[] {
  const end = node.end;
  switch (end.ins) {
    case 'jmp': {
      return [end.next];
    }

    case 'switch_int': {
      return [...end.table.filter(node => node != null), end.default];
    }

    default: {
      return [];
    }
  }
}
