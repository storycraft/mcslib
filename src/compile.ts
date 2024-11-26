import { McsFunction } from '@/ast/fn.js';
import { FunctionDir, FunctionWriter } from './mcslib.js';
import { gen } from './codegen.js';
import { build } from './builder.js';
import { low } from './ir/low.js';
import { ARGUMENTS, NAMESPACE, resolveRegister } from './codegen/intrinsics.js';
import { mangle } from './compile/mangle.js';

export class Compiler {
  private exportMap = new Set<string>();
  private compileMap = new Map<McsFunction, string>();

  constructor(
    private dir: FunctionDir,
  ) {

  }

  async export(name: string, f: McsFunction): Promise<string> {
    const fullName = `${this.dir.namespace}:${name}`;
    if (this.exportMap.has(fullName)) {
      throw new Error(`Function named '${name}' already exists`);
    }
    this.exportMap.add(fullName);

    const inner = await this.compile(f);
    const writer = await FunctionWriter.create(this.dir, name);
    try {
      if (f.sig.args.length > 0) {
        await writer.write(
          `$data modify storage ${NAMESPACE} ${ARGUMENTS} append value [${f.sig.args.map((_, index) => `$(arg${index})d`).join(',')}]`
        );
      }
      await writer.write(
        `function ${inner}`
      );
      await writer.write(
        `data remove storage ${NAMESPACE} ${ARGUMENTS}[-1]`
      );
      if (f.sig.returns != null) {
        await writer.write(
          `return run data get storage ${NAMESPACE} ${resolveRegister(1)}`
        );
      }
    } finally {
      await writer.close();
    }

    return fullName;
  }

  async compile(f: McsFunction): Promise<string> {
    const cached = this.compileMap.get(f);
    if (cached != null) {
      return cached;
    }
    const id = mangle(f.sig, `fn${this.compileMap.size}`);
    const fullName = `${this.dir.namespace}:${id}`;
    this.compileMap.set(f, fullName);

    const ir = low(build(f));

    const tasks: Promise<unknown>[] = [];
    for (const depFn of ir.dependencies) {
      tasks.push(this.compile(depFn));
    }
    await Promise.all(tasks);

    const writer = await FunctionWriter.create(this.dir, id);
    try {
      await gen(
        ir,
        this.compileMap,
        writer,
      );
    } finally {
      await writer.close();
    }

    return fullName;
  }
}
