import { AstType } from '@/ast/type.js';
import { Primitive } from './base.js';
import { McsNumber } from './number.js';
import { mcsIntrinsic, mcsVar } from '../stmt.js';

export class McsString extends Primitive {
  static readonly type: AstType = 'string';

  get length(): McsNumber {
    const length = mcsVar(McsNumber);
    mcsIntrinsic('string_length', false, [this], length);

    return length;
  }
}
