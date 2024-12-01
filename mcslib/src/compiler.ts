import { FnSig, McsFunction } from '@/fn.js';
import { FunctionDir, FunctionWriter } from './lib.js';
import { gen } from './codegen.js';
import { build } from './builder.js';
import { NAMESPACE, resolveRegister, STACK } from './codegen/intrinsics.js';
import { mangle } from './compiler/mangle.js';
import { VarType } from './types.js';
import { low } from './lowering.js';

export type Export<Args extends VarType[]> = {
  name: string,
  fn: McsFunction<FnSig<Args>>,
  args: [...{ [T in keyof Args]: string }],
}

export class Compiler {
  private exportMap = new Set<string>();
  private compileMap = new Map<McsFunction, string>();

  constructor(
    private dir: FunctionDir,
  ) {

  }

  async export<const Args extends VarType[]>(
    {
      name,
      fn,
      args,
    }: Export<Args>
  ) {
    const fullName = `${this.dir.namespace}:${name}`;
    if (this.exportMap.has(fullName)) {
      throw new Error(`Function named '${name}' already exists`);
    }
    this.exportMap.add(fullName);

    const inner = await this.compile(fn);
    const writer = await FunctionWriter.create(this.dir, name);
    try {
      if (fn.sig.args.length > 0) {
        const obj = fn.sig.args.map((_, i) => `a${i}:$(${args[i]})d`).join(',');
        await writer.write(
          `$data modify storage ${NAMESPACE} ${STACK} append value {${obj}}`
        );
      } else {
        await writer.write(
          `data modify storage ${NAMESPACE} ${STACK} append value {}`
        );
      }
      await writer.write(
        `function ${inner}`
      );
      if (fn.sig.returns != null) {
        await writer.write(
          `return run data get storage ${NAMESPACE} ${resolveRegister(1)}`
        );
      }
    } finally {
      await writer.close();
    }
  }

  async compile<
    const Sig extends FnSig
  >(f: McsFunction<Sig>): Promise<string> {
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
