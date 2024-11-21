import { Stmt } from './stmt'
import { VarType } from './types'

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

export type ConstNumber = AstTy<'number'> & {
  value: number,
}

export type Block = AstTy<'block'> & {
  stmts: Stmt[],
}
