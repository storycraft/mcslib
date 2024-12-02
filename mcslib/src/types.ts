/**
 * possible variable types
 */
export type VarType = 'number' | 'string' | 'empty';

export type Primitive = number | string | Record<string, unknown> | null | Primitive[];

/**
 * default const value
 */
export const DEFAULT_CONST: Record<VarType, Primitive> = {
  'number': 0,
  'string': '',
  'empty': null,
}
