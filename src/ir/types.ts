import { VarType } from '@/ast/types';

/**
 * IR types
 */
export type IrType = VarType | 'empty';

/**
 * IR type information table
 */
export const IR_TYPE_TABLE: Record<IrType, TyInfo> = {
  'number': {
    size: 1,
  },
  'empty': {
    size: 0,
  }
}

export type TyInfo = {
  size: number,
}
