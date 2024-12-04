/**
 * possible variable types
 */
export type VarType = VarDataType;

export type VarRefType = `ref<${VarDataType}>`;
export type VarDataType = 'number' | 'string' | 'empty';

export function wrapTyped(type: VarType, value: string): string {
  switch (type) {
    case 'empty': {
      return value;
    }

    case 'number': {
      return Serialize.number(value);
    }

    case 'string': {
      return Serialize.string(value);
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
