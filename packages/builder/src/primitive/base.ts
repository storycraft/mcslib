import { Span } from '@mcslib/core';
import { Id } from '@/ast.js';

export abstract class McsPrimitive implements Id {
  readonly kind = 'id';

  constructor(
    public readonly id: number,
    public readonly span: Span,
  ) { }
}
