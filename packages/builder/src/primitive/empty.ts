import { AstType } from '@/ast/type.js';
import { Primitive } from './base.js';

export class McsEmpty extends Primitive {
  static readonly type: AstType = 'empty';
}
