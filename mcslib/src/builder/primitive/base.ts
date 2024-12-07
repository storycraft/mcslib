import { Span } from '@/span.js';
import { Id } from '@/ast.js';

export abstract class Primitive implements Id {
  readonly kind = 'id';

  constructor(
    public readonly id: number,
    public readonly span: Span,
  ) { }
}
