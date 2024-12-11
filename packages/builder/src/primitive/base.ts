import { Span } from '@mcslib/core';
import { Id } from '@/ast.js';

export abstract class McsPrimitive implements Id {
  readonly kind = 'id';

  protected constructor(
    public readonly id: number,
    public readonly span: Span,
  ) { }
}
