import { FnSig } from '@/fn.js';
import { VarType } from '@/types.js';

const MANGLE_MAP: Record<VarType, string> = {
  'number': 'n',
  'empty': 'v',
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, name: string): string {
  const args = sig.args.map(ty => MANGLE_MAP[ty]).join('');
  const ret = MANGLE_MAP[sig.returns];

  return `mcslib_${args}_${name}_${ret}`;
}
