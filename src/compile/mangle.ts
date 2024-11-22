import { FnSig } from '@/ast/fn';
import { VarType } from '@/ast/types';

enum TypeMap {
  number = 'N'
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, id: number): string {
  const args = sig.args.map(ty => TypeMap[ty]);
  const ret = sig.returns ? TypeMap[sig.returns] : 'V';

  return `_mcslib@${args}@${id}@${ret}`;
}
