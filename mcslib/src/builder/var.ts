import { Id } from '@/ast.js';
import { Span } from '@/span.js';
import { AstType } from '@/ast/type.js';

export type VarType<This extends Id = Id> = {
  new(id: number, span: Span): This;
  readonly type: AstType;
};
