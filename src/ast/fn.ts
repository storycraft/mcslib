import { AstTy, Block, Id } from '.';
import { Expr } from './expr';
import { VarType } from './types';

export type Fn<
    Args extends VarType[] = VarType[],
    Ret extends VarType = VarType,
> = AstTy<'fn'> & {
    args: Args,
    ret?: Ret,
    block: Block,
}

export type Call<
    Args extends VarType[] = VarType[],
    Ret extends VarType = VarType,
> = AstTy<'call'> & {
    fn: McsFunction<Args, Ret>,
    args: Expr[],
}

export type McsFunction<
    Args extends VarType[] = VarType[],
    Ret extends VarType = VarType,
> = {
    args: Args,
    returns: Ret,
    fn: (...args: [...{[I in keyof Args]: Id<Args[I]>}]) => void,
}
