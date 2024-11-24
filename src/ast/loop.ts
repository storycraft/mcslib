import { AstTy } from '../ast.js';
import { Block } from './stmt.js';

export type Loop = AstTy<'loop'> & {
  label?: Label,
  block: Block,
}

export type Label = AstTy<'label'> & {
  name: string,
}

export type Continue = AstTy<'continue'> & {
  label?: Label,
}

export type Break = AstTy<'break'> & {
  label?: Label,
}