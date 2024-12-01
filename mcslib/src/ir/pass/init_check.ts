import { Diagnostics } from '@/diagnostics.js';
import { Index, IrFunction } from '@/ir.js';
import { acceptRvalue, RvalueVisitor } from '../visit.js';
import { Node } from '../node.js';

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

    const end = node.end;
    switch (end.ins) {
      case 'jmp': {
        this.check(end.next);
        break;
      }

      case 'switch_int': {
        for (const branch of end.table) {
          if (!branch) {
            continue;
          }

          new Checker(
            this.cx,
            this.statuses.slice()
          ).check(branch);
        }

        this.check(end.default);
        break;
      }
    }
  }

  visitIndex(rvalue: Index): boolean {
    if (rvalue.origin === 'local' && !this.statuses[rvalue.index]) {
      this.cx.messages.push({
        err: Error(`use of uninitialized variable index: ${rvalue.index}`),
      });
    }

    return true;
  }
}