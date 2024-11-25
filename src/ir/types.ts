import { VarType } from '@/ast/types.js';

/**
 * IR types
 */
export type IrType = VarType | 'empty';

/**
 * IR type default const value
 */
export const IR_DEFAULT_CONST = {
  'number': {
    expr: 'const',
    ty: 'number',
    value: 0,
  },
  'empty': {
    expr: 'const',
    ty: 'empty',
    value: null,
  },
}
