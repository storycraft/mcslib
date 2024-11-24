import { VarType } from './ast/types.js'

/**
 * identifier for ast types
 */
export type AstTy<T extends string> = {
  ast: T,
}

declare const marker: unique symbol;

export type Id<T = VarType> = AstTy<'id'> & {
  id: number,
  [marker]?: T,
}

export type Literal = AstTy<'literal'> & {
  value: number,
}
