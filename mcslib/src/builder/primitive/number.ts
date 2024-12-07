import { AstType } from '@/ast/type.js';
import { Primitive } from './base.js';
import { mcsIntrinsic, mcsVar } from '../stmt.js';

export class McsNumber extends Primitive {
  static readonly type: AstType = 'number';

  floor(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('floor', false, [this], result);

    return result;
  }

  round(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('round', true, [this], result);

    return result;
  }

  ceil(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('ceil', true, [this], result);

    return result;
  }

  recip(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('recip', true, [this], result);

    return result;
  }

  sign(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('sign', false, [this], result);

    return result;
  }

  abs(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('abs', false, [this], result);

    return result;
  }
}
