import { AstType } from '@/ast/type.js';
import { Primitive } from './base.js';

export class McsNumber extends Primitive {
  static readonly type: AstType = 'number';
}
