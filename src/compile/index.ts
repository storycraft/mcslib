import { McsFunction } from '@/ast/fn';
import { FunctionDir } from '..';
import { VarType } from '@/ast/types';
import { mangle } from './mangle';

export class Compiler {
  private functionMap: FunctionMap = new FunctionMap();

  constructor(
    private dir: FunctionDir,
  ) {
    
  }

  export<
    const Args extends VarType[],
    const Ret extends VarType,
  >(name: string, f: McsFunction<Args, Ret>) {

  }
}

type FnItem = {
  id: number,
  name: string,
}

class FunctionMap {
  private nextId: number = 0;
  private functionMap: Map<McsFunction, FnItem> = new Map();

  get(f: McsFunction): FnItem {
    const get = this.functionMap.get(f);
    if (get) {
      return get;
    }

    const id = this.nextId++;
    const item = {
      id,
      name: mangle(f.sig, id),
    };
    this.functionMap.set(f, item);
    return item;
  }

  entries(): Iterator<[McsFunction, FnItem]> {
    return this.functionMap.entries();
  }
}
