import { AstType } from './ast/type.js';
import { Primitive } from './primitive/base.js';

export * from './primitive/number.js';
export * from './primitive/string.js';

export class McsEmpty extends Primitive {
  static readonly type: AstType = 'empty';
}
