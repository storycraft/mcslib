import { diagnostics, Diagnostics } from '@/diagnostics.js';
import { Index, IrFunction } from '@/ir.js';
import { acceptRvalue, RvalueVisitor } from '../visit.js';
import { childrenNodes, Node } from '../node.js';

export function checkInit(ir: IrFunction): Diagnostics[] {
  const messages: Diagnostics[] = [];
  new Checker(
    {
      messages,
      completeSet: new Set<Node>(),
    },
    new Array<boolean>(ir.locals).fill(false),
  ).check(ir.node);

  return messages;
}

type Cx = {
  messages: Diagnostics[],
  completeSet: Set<Node>,
}

class Checker implements RvalueVisitor {
  constructor(
    private cx: Cx,
    private statuses: boolean[],
  ) { }

  check(node: Node) {
    if (this.cx.completeSet.has(node)) {
      return;
    }
    this.cx.completeSet.add(node);

    for (const ins of node.ins) {
      if (ins.ins !== 'assign') {
        continue;
      }
      const index = ins.index.index;
      acceptRvalue(ins.rvalue, this);

      if (!this.statuses[index]) {
        this.statuses[index] = true;
      }
    }

    const children = childrenNodes(node);
    const length = children.length;
    if (length > 1) {
      this.check(children[0]);

      for (let i = 1; i < length; i++) {
        new Checker(
          this.cx,
          this.statuses.slice()
        ).check(children[i]);
      }
    }
  }

  visitIndex(rvalue: Index): boolean {
    if (rvalue.origin === 'local' && !this.statuses[rvalue.index]) {
      this.cx.messages.push(
        diagnostics(
          'error',
          `use of uninitialized variable index: ${rvalue.index}`,
          rvalue.span,
        )
      );
    }

    return true;
  }
}