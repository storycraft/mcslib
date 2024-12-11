import { Span } from '@mcslib/core';
import { McsPrimitive } from './base.js';
import { McsSymbol } from '@/symbol.js';

export class McsEmpty extends McsPrimitive {
  private constructor(id: number, span: Span) {
    super(id, span);
  }

  static create(id: number, span: Span): McsEmpty {
    return new McsEmpty(id, span);
  }

  static [McsSymbol.serialize](): string {
    return '0';
  }
}
