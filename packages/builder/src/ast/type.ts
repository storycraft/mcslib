/**
 * Ast type representation
 */
export type AstType =
  'empty'
  | 'number'
  | 'string'
  | 'compound'
  | 'byte_array'
  | 'int_array'
  | 'long_array'
  | 'list';

export function wrapTyped(type: AstType, value: string): string {
  switch (type) {
    case 'empty': {
      return '0';
    }

    case 'number': {
      return Serialize.number(value);
    }

    case 'string': {
      return Serialize.string(value);
    }

    default: {
      return value;
    }
  }
}

export const Serialize = {
  number(value: string): string {
    return `${value}d`
  },

  string(value: string): string {
    return `"${value}"`;
  }
};
