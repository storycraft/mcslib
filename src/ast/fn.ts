import { AstTy, Block } from '.';
import { Expr } from './expr';
import { Local } from './stmt';
import { VarType } from './types';

export type Fn = AstTy<'fn'> & {
    args: Local[],
    ret?: VarType,
    block: Block,
}

export type Call = AstTy<'call'> & {
    fn: (...args: Expr[]) => void,
    args: Expr[],
}
