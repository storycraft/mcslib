import { Stmt } from './stmt'

/**
 * identifier for ast types
 */
export type AstTy<T extends string> = {
    ast: T,
}

export type Id = AstTy<'id'> & {
    id: number,
}

export type ConstNumber = AstTy<'number'> & {
    value: number,
}

export type Block = AstTy<'block'> & {
    stmts: Stmt[],
}
