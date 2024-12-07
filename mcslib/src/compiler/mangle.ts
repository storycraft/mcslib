import { FnSig } from '@/fn.js';
import { AstType } from '@/ast/type.js';
import { VarType } from '@/builder/var.js';

const MANGLE_MAP: Record<AstType, string> = {
  'number': 'd',
  'string': 's',
  'compound': 'c',
  'list': 'l',
  'int_array': 'ai',
  'byte_array': 'ab',
  'long_array': 'al',
  'empty': 'v',
}

export function mangle<
  Args extends VarType[],
  Ret extends VarType,
>(sig: FnSig<Args, Ret>, name: string): string {
  const args = sig.args.map(
    constructor => MANGLE_MAP[constructor.type]
  ).join('');
  const ret = MANGLE_MAP[sig.returns.type];

  return `mcslib/${args}_${name}_${ret}`;
}
