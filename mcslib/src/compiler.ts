import { FnSig, McsFunction } from '@mcslib/builder/fn.js';
import { FunctionDir, FunctionWriter } from './lib.js';
import { emit, NAMESPACE, resolveRegister, STACK } from './emit.js';
import { build } from '@mcslib/builder';
import { mangle } from './compiler/mangle.js';
import { wrapTyped } from '@mcslib/builder/ast/type.js';
import { low } from './lowering.js';
import { checkType } from './lowering/pass/type-check.js';
import { checkInit } from './ir/pass/init_check.js';
import { Diagnostic } from '@mcslib/core';
import { fold } from './lowering/pass/const-fold.js';
import { newResolver } from '@mcslib/builder/ast/type-resolver.js';
import { VarType } from '@mcslib/builder/var.js';

export type Export<Args extends VarType[]> = {
  name: string,
  fn: McsFunction<FnSig<Args>>,
  args: { [T in keyof Args]: string },
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
          const constructor = fn.sig.args[i];
          const name = args[i];

          if (constructor.type !== 'empty') {
            keys.push(`a${i}:${wrapTyped(constructor.type, `$(${name})`)}`);
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

      if (fn.sig.returns.type === 'number') {
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
    const typeResolver = newResolver(tree);

    // Perform type checking
    {
      const diagnostics = checkType(buildRes.f, typeResolver);
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
    const ir = low(tree, typeResolver);

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
