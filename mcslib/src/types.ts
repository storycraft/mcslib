/**
 * possible variable types
 */
export type VarType = 'number' | 'string' | 'empty';

export type Primitive = number | string | Record<string, unknown> | null | Primitive[];
