import { Span } from '@mcslib/core';
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
  end: EndIns = { ins: 'unreachable', span: Span.callSite(1), },
): Node {
  return {
    ins: [],
    end,
  };
}

/**
 * Traverse every nodes in a graph once from the top
 * @param start node to start traverse
 */
export function* traverseNode(
  start: Node
): Generator<Node, void, void> {
  const set = new Set<Node>();
  const stack: Node[] = [];
  for (let node: Node | undefined = start; node != null; node = stack.pop()) {
    if (set.has(node)) {
      continue;
    }
    set.add(node);
    stack.push(...childrenNodes(node));
    yield node;
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
      return [...end.table.filter(jmp => jmp != null), end.default];
    }

    default: {
      return [];
    }
  }
}
