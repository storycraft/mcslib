import { AstTy, Block } from '.';

export type Loop = AstTy<'loop'> & {
    label?: Label,
    block: Block,
}

export type Label = AstTy<'label'> & {
    name: string,
}

export type Continue = AstTy<'continue'>;

export type Break = AstTy<'break'> & {
    label?: Label,
}