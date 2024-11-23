import { InsTy, Node } from '.';

export type EndIns = Unreachable | SwitchInt | Jmp | Ret;

export type Ret = InsTy<'ret'> & {
  index: number,
};

export type Jmp = InsTy<'jmp'> & {
  next: Node,
};

export type SwitchInt = InsTy<'switch_int'> & {
  index: number,
  table: Node[],
  default: Node,
}

export type Unreachable = InsTy<'unreachable'>;
