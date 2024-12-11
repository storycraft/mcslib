import { McsSymbol } from './symbol.js';

export interface Serializable {
  [McsSymbol.serialize](): void;
}
