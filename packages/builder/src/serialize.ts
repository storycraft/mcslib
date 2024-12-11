import { McsSymbol } from './symbol.js';

export interface Serializable {
  [McsSymbol.serialize]?(value: string): string;
}

export function serialize(type: Serializable, value: string): string {
  return type[McsSymbol.serialize]?.(value) ?? value;
}
