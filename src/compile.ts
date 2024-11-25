import { McsFunction } from '@/ast/fn.js';
import { FunctionDir } from './mcslib.js';
import { mangle } from './compile/mangle.js';

export class Compiler {
  private functionMap: FunctionMap = new FunctionMap();

  constructor(
    private dir: FunctionDir,
  ) {
    
  }

  async export(name: string, f: McsFunction) {
    
  }

  async compile(f: McsFunction): Promise<string> {
    return '';
  }
}

type FnItem = {
  id: number,
  name: string,
}

class FunctionMap {
  private nextId = 0;
  private functionMap = new Map<McsFunction, FnItem>();

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
