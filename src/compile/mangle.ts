import { FnSig } from '@/ast/fn.js';
import { VarType } from '@/ast/types.js';
import { IrType } from '@/ir/types.js';

const MANGLE_MAP: Record<IrType, string> = {
  'number': 'N',
  'empty': 'V',
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, name: string): string {
  const args = sig.args.map(ty => MANGLE_MAP[ty]).join('');
  const ret = MANGLE_MAP[sig.returns ?? 'empty'];

  return `mcslib@${args}@${name}@${ret}`;
}
