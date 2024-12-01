/**
 * possible variable types
 */
export type VarType = 'number' | 'empty';

export type Primitive = number | string | Record<string, unknown> | null | Primitive[];

/**
 * default const value
 */
export const DEFAULT_CONST: Record<VarType, Primitive> = {
  'number': 0,
  'empty': null,
}
