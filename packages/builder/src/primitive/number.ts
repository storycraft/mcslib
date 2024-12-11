import { McsPrimitive } from './base.js';
import { mcsIntrinsic, mcsVar } from '../stmt.js';
import { Expr } from '@/ast.js';
import { McsSymbol } from '@/symbol.js';
import { Span } from '@mcslib/core';

export class McsNumber extends McsPrimitive {
  private constructor(id: number, span: Span) {
    super(id, span);
  }

  static create(id: number, span: Span): McsNumber {
    return new McsNumber(id, span);
  }

  floor(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('floor', false, [McsNumber], [this], result);

    return result;
  }

  round(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('round', true, [McsNumber], [this], result);

    return result;
  }

  ceil(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('ceil', true, [McsNumber], [this], result);

    return result;
  }

  recip(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('recip', true, [McsNumber], [this], result);

    return result;
  }

  sign(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('sign', false, [McsNumber], [this], result);

    return result;
  }

  abs(): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('abs', false, [McsNumber], [this], result);

    return result;
  }

  max(other: Expr): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('max', false, [McsNumber, McsNumber], [this, other], result);
    return result;
  }

  min(other: Expr): McsNumber {
    const result = mcsVar(McsNumber);
    mcsIntrinsic('min', false, [McsNumber, McsNumber], [this, other], result);
    return result;
  }

  static [McsSymbol.serialize](value: string): string {
    return `${value}d`;
  }
}
