import { FnSig } from '@/ast/fn';
import { VarType } from '@/ast/types';

enum TypeMap {
  number = 'N',
  void = 'V',
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, id: number): string {
  return `_mcslib@${sig.args.map(ty => TypeMap[ty])}@${id}@${TypeMap[sig.returns]}`;
}
