import { Index, InsTy, Ref } from '../ir.js';
import { Node } from './node.js';

export type EndIns = Unreachable | SwitchInt | Jmp | Ret;

export type Ret = InsTy<'ret'> & {
  ref: Ref,
};

export type Jmp = InsTy<'jmp'> & {
  next: Node,
};

export type SwitchInt = InsTy<'switch_int'> & {
  index: Index,
  table: (Node | null)[],
  default: Node,
}

export type Unreachable = InsTy<'unreachable'>;
