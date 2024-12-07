import { AstType } from '@/ast/type.js';
import { Primitive } from './base.js';

export class McsString extends Primitive {
  static readonly type: AstType = 'string';
}
