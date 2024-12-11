import { AstType } from '@/ast/type.js';
import { McsPrimitive } from './base.js';
import { McsNumber } from './number.js';
import { mcsAssign, mcsIntrinsic, mcsVar } from '../stmt.js';
import { Expr } from '@/ast.js';

export class McsString extends McsPrimitive {
  static readonly type: AstType = 'string';

  get length(): McsNumber {
    const length = mcsVar(McsNumber);
    mcsIntrinsic(
      'string_length',
      false,
      ['string'],
      [this],
      length
    );

    return length;
  }

  slice(start?: Expr, end?: Expr): McsString {
    const sliced = mcsVar(McsString);

    if (start && end) {
      mcsIntrinsic(
        'slice_start_end',
        true,
        ['string', 'number', 'number'],
        [this, start, end],
        sliced
      );
    } else if (start) {
      mcsIntrinsic(
        'slice_start',
        true,
        ['string', 'number'],
        [this, start],
        sliced
      );
    } else {
      mcsAssign(sliced, this);
    }

    return sliced;
  }
}
