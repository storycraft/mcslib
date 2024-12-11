import { McsPrimitive } from './base.js';
import { McsNumber } from './number.js';
import { mcsAssign, mcsIntrinsic, mcsVar } from '../stmt.js';
import { Expr } from '@/ast.js';
import { McsSymbol } from '@/symbol.js';
import { Span } from '@mcslib/core';

export class McsString extends McsPrimitive {
  private constructor(id: number, span: Span) {
    super(id, span);
  }

  static create(id: number, span: Span): McsString {
    return new McsString(id, span);
  }

  get length(): McsNumber {
    const length = mcsVar(McsNumber);
    mcsIntrinsic(
      'string_length',
      false,
      [McsString],
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
        [McsString, McsNumber, McsNumber],
        [this, start, end],
        sliced
      );
    } else if (start) {
      mcsIntrinsic(
        'slice_start',
        true,
        [McsString, McsNumber],
        [this, start],
        sliced
      );
    } else {
      mcsAssign(sliced, this);
    }

    return sliced;
  }

  static [McsSymbol.serialize](value: string): string {
    return `"${value}"`;
  }
}
