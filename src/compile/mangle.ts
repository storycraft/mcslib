import { FnSig } from '@/ast/fn';
import { VarType } from '@/ast/types';
import { IrType } from '@/ir/types';

const MANGLE_MAP: Record<IrType, string> = {
  'number': 'N',
  'empty': 'V',
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, id: number): string {
  const args = sig.args.map(ty => MANGLE_MAP[ty]);
  const ret = MANGLE_MAP[sig.returns ?? 'empty'];

  return `_mcslib@${args}@${id}@${ret}`;
}
