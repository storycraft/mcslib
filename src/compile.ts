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

  async export(name: string, f: McsFunction) {
    if (this.exportMap.has(name)) {
      throw new Error(`Function named '${name}' already exists`);
    }
    const innerName = await this.compile(f);
    const writer = await FunctionWriter.create(this.dir, name);

    await writer.write(
      `$data modify storage ${NAMESPACE} ${ARGUMENTS} append value [${f.sig.args.map((_, index) => `$(arg${index})d`).join(',')}]`
    );
    await writer.write(
      `function ${writer.namespace}:${innerName}`
    );
    if (f.sig.returns != null) {
      await writer.write(
        `return run data get storage ${NAMESPACE} ${resolveRegister(1)}`
      );
    }
  }

  async compile(f: McsFunction): Promise<string> {
    const name = this.compileMap.get(f);
    if (name != null) {
      return name;
    }
    const id = mangle(f.sig, `fn${this.compileMap.size}`);
    this.compileMap.set(f, id);

    const ir = low(build(f));

    const tasks: Promise<unknown>[] = [];
    for (const depFn of ir.dependencies) {
      tasks.push(this.compile(depFn));
    }
    await Promise.all(tasks);

    await gen(
      ir,
      this.compileMap,
      await FunctionWriter.create(this.dir, id)
    );

    return id;
  }
}
