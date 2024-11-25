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
    expr: 'const' as const,
    ty: 'number' as const,
    value: 0,
  },
  'empty': {
    expr: 'const' as const,
    ty: 'empty' as const,
    value: null,
  },
}
