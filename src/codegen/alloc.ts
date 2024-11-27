import { ExprIns, Index, IrFunction, Ref } from '@/ir.js';
import { Node, traverseNode } from '@/ir/node.js';
import { IrType } from '@/ir/types.js';

export type Location = None | R1 | R2 | Argument | Frame;

type LocVariant<At extends string> = {
  at: At,
}

type None = LocVariant<'none'>;
type R1 = LocVariant<'r1'>;
type R2 = LocVariant<'r2'>;
type Argument = LocVariant<'argument'> & {
  index: number,
}
type Frame = LocVariant<'frame'> & {
  index: number,
}

export interface Alloc {
  readonly stackSize: number,
  resolve(index: Index): Location;
}

export function alloc(ir: IrFunction): Alloc {
  const args = new Map<number, Location>();
  ir.storage.arguments.forEach((arg, index) => {
    args.set(index, {
      at: 'argument',
      index,
    });
  });

  const [stackSize, locals] = place(ir.storage.locals, ir.node);
  return {
    stackSize,
    resolve({
      origin,
      index
    }) {
      let location: Location | undefined;
      if (origin === 'argument') {
        location = args.get(index);
      } else {
        location = locals.get(index);
      }

      if (location == null) {
        throw new Error(`tried to resolve invalid index: ${index} origin: ${origin}`);
      }

      return location;
    },
  };
}

function place(locals: IrType[], start: Node): [number, Map<number, Location>] {
  const cx: Cx = {
    locals,
    map: new Map<number, Location>(),
    nextLocalId: 0,
    assignments: [],
  };
  locals.forEach((_, index) => {
    cx.map.set(index, { at: 'none' });
  });

  for (const node of traverseNode(start)) {
    const length = node.ins.length;
    for (let i = 0; i < length; i++) {
      const ins = node.ins[i];
      switch (ins.ins) {
        case 'assign': {
          visitExpr(cx, ins.expr);
          if (ins.index.origin === 'local') {
            cx.assignments.push(ins.index.index);
          }
          break;
        }
      }
    }

    const end = node.end;
    switch (end.ins) {
      case 'switch_int': {
        visitRefs(cx, end.index);
        break;
      }

      default: {
        break;
      }
    }

    cx.assignments = [];
  }

  return [cx.nextLocalId, cx.map];
}

type Cx = {
  locals: IrType[],
  map: Map<number, Location>,
  nextLocalId: number,
  assignments: number[],
}

export function visitExpr(cx: Cx, ins: ExprIns) {
  switch (ins.expr) {
    case 'neg':
    case 'not': {
      visitRefs(cx, ins.operand);
      break;
    }

    case 'arith':
    case 'cmp':
    case 'bool': {
      visitRefs(cx, ins.left, ins.right);
      break;
    }

    case 'call': {
      visitRefs(cx, ...ins.args);
      break;
    }

    case 'index': {
      visitRefs(cx, ins);
      break;
    }
  }
}

function visitRefs(cx: Cx, first?: Ref, second?: Ref, ...rest: Ref[]) {
  const lastAssignIndex = cx.assignments[cx.assignments.length - 1];

  first: if (first && first.expr === 'index' && first.origin === 'local') {
    const item = cx.map.get(first.index);
    if (!item) {
      break first;
    }

    if (item.at === 'none' && lastAssignIndex === first.index) {
      cx.map.set(
        first.index,
        { at: 'r1' },
      );
    } else if (item.at !== 'frame') {
      cx.map.set(
        first.index,
        {
          at: 'frame',
          index: cx.nextLocalId++,
        },
      );
    }
  }

  second: if (second && second.expr === 'index' && second.origin === 'local') {
    const item = cx.map.get(second.index);
    if (!item) {
      break second;
    }

    if (item.at === 'none' && lastAssignIndex === second.index) {
      cx.map.set(
        second.index,
        { at: 'r2' },
      );
    } else if (item.at !== 'frame') {
      cx.map.set(
        second.index,
        {
          at: 'frame',
          index: cx.nextLocalId++,
        },
      );
    }
  }

  for (const ref of rest) {
    if (ref.expr !== 'index' || ref.origin !== 'local') {
      continue;
    }

    const item = cx.map.get(ref.index);
    if (!item) {
      continue;
    }

    if (item.at === 'none') {
      cx.map.set(
        ref.index,
        {
          at: 'frame',
          index: cx.nextLocalId++,
        },
      );
    }
  }
}