import { Span } from '@mcslib/core';
import { Id } from './ast.js';
import { Serializable } from './serialize.js';

export interface McsType<T extends Id = Id> extends Serializable {
  create(id: number, span: Span): T;
};

export type TypedId<T extends McsType> = T extends McsType<infer I> ? I : never;
