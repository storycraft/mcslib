import { VarType } from '@/ast/types.js';
import { Const } from '@/ir.js';

/**
 * IR types
 */
export type IrType = VarType | 'empty';

/**
 * IR type default const value
 */
export const IR_DEFAULT_CONST: Record<IrType, Const> = {
  'number': {
    kind: 'const',
    ty: 'number',
    value: 0,
  },
  'empty': {
    kind: 'const',
    ty: 'empty',
    value: null,
  },
}