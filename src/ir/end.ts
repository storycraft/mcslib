import { ExprTy, Node } from '.';

export type EndIns = SwitchInt | JmpIns | ReturnIns;

export type ReturnIns = ExprTy<'ret'> & {
  index: number,
};

export type JmpIns = ExprTy<'ret'> & {
  next: Node,
};

export type SwitchInt = ExprTy<'switch_int'> & {
  table: Node[],
  default: Node,
}
