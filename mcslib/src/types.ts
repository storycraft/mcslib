/**
 * possible variable types
 */
export type VarType = VarDataType;

export type VarDataType = 'number' | 'string' | 'empty';

export type Primitive = number | string | Record<string, unknown> | null | Primitive[];

export function wrapTyped(type: VarType, value: string): string {
  switch (type) {
    case 'empty': {
      return value;
    }

    case 'number': {
      return `${value}d`;
    }

    case 'string': {
      return `"${value}"`;
    }
  }
}
