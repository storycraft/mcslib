import { AstType } from '@/ast/type.js';
import { McsPrimitive } from './base.js';
import { mcsIntrinsic, mcsVar } from '../stmt.js';
import { Expr } from '@/ast.js';

export class McsNumber extends McsPrimitive {
  static readonly type: AstType = 'number';

  floor(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('floor', false, ['number'], [this], result);

    return result;
  }

  round(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('round', true, ['number'], [this], result);

    return result;
  }

  ceil(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('ceil', true, ['number'], [this], result);

    return result;
  }

  recip(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('recip', true, ['number'], [this], result);

    return result;
  }

  sign(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('sign', false, ['number'], [this], result);

    return result;
  }

  abs(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('abs', false, ['number'], [this], result);

    return result;
  }

  max(other: Expr): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('max', false, ['number', 'number'], [this, other], result);
    return result;
  }

  min(other: Expr): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('min', false, ['number', 'number'], [this, other], result);
    return result;
  }
}
