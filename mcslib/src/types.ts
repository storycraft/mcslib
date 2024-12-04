/**
 * possible variable types
 */
export type VarType = VarDataType;

export type VarRefType = `ref<${VarDataType}>`;
export type VarDataType = 'number' | 'string' | 'object' | 'empty';

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

    case 'object': {
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
