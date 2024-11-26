import { IrFunction, Storage } from '@/ir.js';
import { search } from './search.js';

export type Location = None | R1 | Argument | Frame;

type LocVariant<At extends string> = {
  at: At,
}

type None = LocVariant<'none'>;
type R1 = LocVariant<'r1'>;
type Argument = LocVariant<'argument'> & {
  index: number,
}
type Frame = LocVariant<'frame'> & {
  index: number,
}

export interface Alloc {
  get stackSize(): number,
  alloc(index: number, storage: Storage): Location;
}

export function allocator(ir: IrFunction): Alloc {
  const set = new Set<number>();

  let nextStackIndex = 0;
  let nextArgsIndex = 0;
  return {
    get stackSize() {
      return nextStackIndex;
    },

    alloc(index, storage) {
      if (set.has(index)) {
        throw new Error(`tried to allocate index: ${index} twice`);
      }
      set.add(index);

      const result = search(index, ir.node);
      if (result.references === 0) {
        return { at: 'none', index: 0 };
      }

      if (storage.origin === 'argument') {
        return { at: 'argument', index: nextArgsIndex++ };
      }

      return { at: 'frame', index: nextStackIndex++ };
    },
  };
}
