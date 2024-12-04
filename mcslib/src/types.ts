/**
 * possible variable types
 */
export type VarType = VarDataType;

export type VarRefType = `ref<${VarDataType}>`;
export type VarDataType = 'empty' | 'number' | 'string' | 'compound' | VarArrayType | 'list';
export type VarArrayType = 'byte_array' | 'int_array' | 'long_array';

export function wrapTyped(type: VarType, value: string): string {
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
