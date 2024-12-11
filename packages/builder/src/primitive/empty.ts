import { AstType } from '@/ast/type.js';
import { McsPrimitive } from './base.js';

export class McsEmpty extends McsPrimitive {
  static readonly type: AstType = 'empty';
}
