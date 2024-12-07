import { Rvalue, Index, IrFunction, Ref } from '@/ir.js';
import { Node, traverseNode } from '@/ir/node.js';

export type Location = None | Register | Argument | Local;

type LocVariant<At extends string> = {
  at: At,
}

type None = LocVariant<'none'>;
type Register = LocVariant<'register'> & {
  index: number,
}
type Argument = LocVariant<'argument'> & {
  index: number,
}
type Local = LocVariant<'local'> & {
  index: number,
}

export const Location = {
  none(): Location {
    return { at: 'none' };
  },

  register(index: number): Location {
    return { at: 'register', index };
  },

  argument(index: number): Location {
    return { at: 'argument', index };
  },

  local(index: number): Location {
    return { at: 'local', index };
  },
}

export interface Alloc {
  readonly arguments: number,
  readonly stackSize: number,
  resolve(index: Index): Location;
}

export function alloc(ir: IrFunction): Alloc {
  const args: Location[] = ir.sig.args.map((_, index) => {
    return {
      at: 'argument',
      index,
    };
  });

  const [stackSize, locals] = place(ir.locals, ir.node);
  return {
    stackSize,
    arguments: ir.sig.args.length,
    resolve({
      origin,
      index
    }) {
      let location: Location | undefined;
      if (origin === 'argument') {
        location = args.at(index);
      } else {
        location = locals.at(index);
      }

      if (location == null) {
        throw new Error(`tried to resolve invalid index: ${index} origin: ${origin}`);
      }

      return location;
    },
  };
}

function place(
  locals: number,
  start: Node
): [number, Location[]] {
  const cx: Cx = {
    locs: new Array<Location>(locals).fill({ at: 'none' }),
    nextLocalId: 0,
    assignments: [],
  };

  for (const node of traverseNode(start)) {
    const length = node.ins.length;
    for (let i = 0; i < length; i++) {
      const ins = node.ins[i];
      switch (ins.ins) {
        case 'assign': {
          visitExpr(cx, ins.rvalue);
          if (ins.index.origin === 'local') {
            cx.assignments.push(ins.index.index);
          }
          break;
        }

        case 'execute': {
          for (const template of ins.templates) {
            for (const part of template) {
              if (part.part === 'ref') {
                placeInLocal(cx, part.ref);
              }
            }
          }
          break;
        }
      }
    }

    const end = node.end;
    switch (end.ins) {
      case 'switch_int': {
        replaceRefs(cx, end.ref);
        break;
      }

      default: {
        break;
      }
    }

    cx.assignments = [];
  }

  return [cx.nextLocalId, cx.locs];
}

type Cx = {
  locs: Location[],
  nextLocalId: number,
  assignments: number[],
}

export function visitExpr(cx: Cx, ins: Rvalue) {
  switch (ins.kind) {
    case 'unary': {
      replaceRefs(cx, ins.operand);
      break;
    }

    case 'binary': {
      replaceRefs(cx, ins.left, ins.right);
      break;
    }

    case 'call': {
      replaceRefs(cx, ...ins.args);
      break;
    }

    case 'index': {
      replaceRefs(cx, ins);
      break;
    }

    case 'output': {
      for (const part of ins.template) {
        if (part.part === 'ref') {
          placeInLocal(cx, part.ref);
        }
      }
      break;
    }
  }
}

function replaceRefs(cx: Cx, first?: Ref, second?: Ref, ...rest: Ref[]) {
  const lastAssignIndex = cx.assignments[cx.assignments.length - 1];

  first: if (first?.kind === 'index' && first.origin === 'local') {
    const item = cx.locs.at(first.index);
    if (!item) {
      break first;
    }

    if (item.at === 'none' && lastAssignIndex === first.index) {
      cx.locs[first.index] = { at: 'register', index: 0 };
    } else if (item.at !== 'local') {
      cx.locs[first.index] = {
        at: 'local',
        index: cx.nextLocalId++,
      };
    }
  }

  second: if (second?.kind === 'index' && second.origin === 'local') {
    const item = cx.locs.at(second.index);
    if (!item) {
      break second;
    }

    if (item.at === 'none' && lastAssignIndex === second.index) {
      cx.locs[second.index] = { at: 'register', index: 1 };
    } else if (item.at !== 'local') {
      cx.locs[second.index] = {
        at: 'local',
        index: cx.nextLocalId++,
      };
    }
  }

  if (rest.length > 0) {
    for (const ref of rest) {
      placeInLocal(cx, ref);
    }
  }
}

function placeInLocal(cx: Cx, ref: Ref) {
  if (ref.kind !== 'index' || ref.origin !== 'local') {
    return;
  }

  const item = cx.locs.at(ref.index);
  if (!item) {
    return;
  }

  if (item.at !== 'local') {
    cx.locs[ref.index] = {
      at: 'local',
      index: cx.nextLocalId++,
    };
  }
}
