import { IrType } from '@/ir/types.js';
import { Storage } from '@/ir.js';

export type Placement = {
  location: Location,
  ty: IrType,
}

export type At = 'argument' | 'frame' | 'register';

export type Location = {
  at: At,
  index: number,
};

export interface Alloc {
  alloc(storage: Storage): Placement;
}
