import { FnSig, McsFunction } from '@/fn.js';
import { FunctionDir, FunctionWriter } from './lib.js';
import { emit, NAMESPACE, resolveRegister, STACK } from './emit.js';
import { build } from './builder.js';
import { mangle } from './compiler/mangle.js';
import { VarType, wrapTyped } from './types.js';
import { low } from './lowering.js';
import { checkType } from './ast/pass/type-check.js';
import { checkInit } from './ir/pass/init_check.js';
import { Diagnostic } from './diagnostic.js';
import { fold } from './ast/pass/const-fold.js';

export type Export<Args extends VarType[]> = {
  name: string,
  fn: McsFunction<FnSig<Args>>,
  args: [...{ [T in keyof Args]: string }],
}

export type CompileResult = {
  fullName: string,
  diagnostics: Diagnostic[],
}

export class Compiler {
  private exportSet = new Set<string>();
  private compileMap = new Map<McsFunction, string>();

  constructor(
    private dir: FunctionDir,
  ) { }

  async export<const Args extends VarType[]>(
    {
      name,
      fn,
      args,
    }: Export<Args>
  ): Promise<CompileResult> {
    const fullName = `${this.dir.namespace}:${name}`;
    if (this.exportSet.has(fullName)) {
      throw new Error(`Function named '${name}' already exists`);
    }
    this.exportSet.add(fullName);

    const { fullName: inner, diagnostics } = await this.compile(fn);
    const writer = await FunctionWriter.create(this.dir, name);
    try {
      const length = fn.sig.args.length;
      if (length > 0) {
        const keys: string[] = [];
        for (let i = 0; i < length; i++) {
          const type = fn.sig.args[i];
          const name = args[i];

          if (type !== 'empty') {
            keys.push(`a${i}:${wrapTyped(type, `$(${name})`)}`);
          }
        }

        await writer.write(
          `$data modify storage ${NAMESPACE} ${STACK} append value {${keys.join(',')}}`
        );
      } else {
        await writer.write(
          `data modify storage ${NAMESPACE} ${STACK} append value {}`
        );
      }
      await writer.write(
        `function ${inner}`
      );

      if (fn.sig.returns === 'number') {
        await writer.write(
          `return run data get storage ${NAMESPACE} ${resolveRegister(0)}`
        );
      }
    } finally {
      await writer.close();
    }

    return {
      fullName,
      diagnostics,
    };
  }

  async compile<
    const Sig extends FnSig
  >(f: McsFunction<Sig>): Promise<CompileResult> {
    const cached = this.compileMap.get(f);
    if (cached != null) {
      return { fullName: cached, diagnostics: [] };
    }
    const id = mangle(f.sig, `fn${this.compileMap.size}`);
    const fullName = `${this.dir.namespace}:${id}`;
    this.compileMap.set(f, fullName);

    // Build syntax tree
    const buildRes = build(f);
    if (buildRes.diagnostics.length > 0) {
      return {
        fullName,
        diagnostics: buildRes.diagnostics,
      };
    }
    const tree = buildRes.f;

    // Perform type checking
    {
      const diagnostics = checkType(buildRes.f);
      if (diagnostics.length > 0) {
        return {
          fullName,
          diagnostics,
        };
      }
    }

    // Constant folding
    fold(tree.block);

    // Ir lowering
    const ir = low(tree);

    // Perform init checking
    {
      const diagnostics = checkInit(ir);
      if (diagnostics.length > 0) {
        return {
          fullName,
          diagnostics,
        }
      }
    }

    const tasks: Promise<CompileResult>[] = [];
    for (const depFn of ir.dependencies) {
      tasks.push(this.compile(depFn));
    }
    {
      const diagnostics: Diagnostic[] = [];
      for (const result of await Promise.all(tasks)) {
        diagnostics.push(...result.diagnostics);
      }
      if (diagnostics.length > 0) {
        return {
          fullName,
          diagnostics,
        };
      }
    }

    const writer = await FunctionWriter.create(this.dir, id);
    try {
      await emit(
        ir,
        this.compileMap,
        writer,
      );
    } finally {
      await writer.close();
    }

    return {
      fullName,
      diagnostics: [],
    };
  }
}
