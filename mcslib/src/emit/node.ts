import { Env, NAMESPACE, resolveLoc, resolveStack, STACK, TrackedWriter } from '@/emit.js';
import { ExecuteTemplate, Rvalue, Ins } from '@/ir.js';
import { EndIns } from '@/ir/end.js';
import { Node } from '@/ir/node.js';
import { binary, call, unary } from './rvalue.js';
import { Location } from './alloc.js';

export async function walkNode(env: Env, node: Node, writer: TrackedWriter) {
  for (const ins of node.ins) {
    await walkIns(env, ins, writer);
  }

  await walkEndIns(env, node.end, writer);
}

async function walkIns(env: Env, ins: Ins, writer: TrackedWriter) {
  switch (ins.ins) {
    case 'assign': {
      await assignRvalue(env, ins.rvalue, env.alloc.resolve(ins.index), writer);
      break;
    }

    case 'execute': {
      if (hasRef(...ins.templates)) {
        const executeWriter = await writer.branch();
        try {
          await writer.inner.write(
            `function ${executeWriter.inner.namespace}:${executeWriter.inner.name} with storage ${NAMESPACE} ${STACK}[-1]`
          );

          for (const template of ins.templates) {
            await executeWriter.inner.write(formatTemplate(env, template));
          }
        } finally {
          await executeWriter.close();
        }
      } else {
        for (const template of ins.templates) {
          await writer.inner.write(formatTemplate(env, template));
        }
      }

      break;
    }
  }
}

function formatTemplate(
  env: Env,
  template: ExecuteTemplate,
  cmd = '',
): string {
  let macro = false;
  for (const part of template) {
    switch (part.part) {
      case 'ref': {
        const ref = part.ref;

        if (ref.kind === 'const') {
          cmd += JSON.stringify(ref.value);
        } else {
          if (!macro) {
            macro = true;
          }

          const loc = env.alloc.resolve(ref);
          if (loc.at !== 'local' && loc.at !== 'argument') {
            throw new Error('Execute ref must be allocated in local');
          }
          cmd += `$(${resolveStack(loc)})`;
        }
        break;
      }

      case 'text': {
        cmd += part.text;
        break;
      }
    }
  }

  if (macro) {
    return `$${cmd}`;
  } else {
    return cmd;
  }
}

function hasRef(...templates: ExecuteTemplate[]): boolean {
  return templates.some(
    template => template.some(({ part: ty }) => ty === 'ref')
  );
}

async function assignRvalue(
  env: Env,
  rvalue: Rvalue,
  to: Location,
  writer: TrackedWriter
) {
  switch (rvalue.kind) {
    case 'index': {
      await writer.copy(env.alloc.resolve(rvalue), to);
      break;
    }

    case 'const': {
      await writer.copyConst(rvalue.type, rvalue.value, to);
      break;
    }

    case 'binary': {
      await writer.copyRef(env.alloc, rvalue.left, Location.register(0));
      await writer.copyRef(env.alloc, rvalue.right, Location.register(1));
      await binary(rvalue.op, writer);
      await writer.copy(Location.register(0), to);
      break;
    }

    case 'unary': {
      await writer.copyRef(env.alloc, rvalue.operand, Location.register(0));
      await unary(rvalue.op, writer);
      await writer.copy(Location.register(0), to);
      break;
    }

    case 'call': {
      const fullName = env.linkMap.get(rvalue.f);
      if (fullName == null) {
        throw new Error(`Function ${rvalue.f.buildFn} cannot be found from the link map`);
      }

      await call(env, fullName, rvalue.args, writer);
      await writer.copy(Location.register(0), to);
      break;
    }

    case 'output': {
      let run: string;
      if (hasRef(rvalue.template)) {
        const executeWriter = await writer.branch();
        try {
          run = `function ${executeWriter.inner.namespace}:${executeWriter.inner.name} with storage ${NAMESPACE} ${STACK}[-1]`;
          await executeWriter.inner.write(formatTemplate(env, rvalue.template, 'return run '));
        } finally {
          await executeWriter.close();
        }
      } else {
        run = formatTemplate(env, rvalue.template);
      }

      await writer.inner.write(
        `execute store result storage ${NAMESPACE} ${resolveLoc(to)} double 1 run ${run}`
      );
      writer.invalidate(to);
      break;
    }

    default: {
      break;
    }
  }
}

async function walkEndIns(env: Env, ins: EndIns, writer: TrackedWriter) {
  switch (ins.ins) {
    case 'jmp': {
      const name = await env.nodeMap.branch(env, ins.next, writer);
      await writer.inner.write(
        `function ${writer.inner.namespace}:${name}`
      );
      break;
    }

    case 'switch_int': {
      await writer.copyRef(env.alloc, ins.ref, Location.register(0));

      const namespace = writer.inner.namespace;

      const length = ins.table.length;
      if (length === 1 && ins.table[0]) {
        const name = await env.nodeMap.branch(env, ins.table[0], writer);
        await writer.inner.write(
          `execute if predicate mcs_intrinsic:zero run return run function ${namespace}:${name}`
        );
      } else {
        for (let i = 0; i < length; i++) {
          const target = ins.table[i];
          if (!target) {
            continue;
          }

          const name = await env.nodeMap.branch(env, target, writer);
          await writer.copyConst(
            'number',
            i.toString(),
            Location.register(1)
          );
          await writer.inner.write(
            `execute if predicate mcs_intrinsic:eq run return run function ${namespace}:${name}`
          );
        }
      }

      await env.nodeMap.expand(env, ins.default, writer);
      break;
    }

    case 'ret': {
      await writer.copyRef(env.alloc, ins.ref, Location.register(0));
      if (env.alloc.stackAllocated > 0) {
        await writer.inner.write(
          `data remove storage ${NAMESPACE} ${STACK}[-1]`
        );
      }

      break;
    }

    case 'unreachable': {
      throw new Error('Reached unreachable ended node');
    }
  }
}

export class NodeMap {
  private map = new Map<Node, string>();

  constructor(root: Node, name: string) {
    this.map.set(root, name);
  }

  async expand(
    env: Env,
    node: Node,
    writer: TrackedWriter
  ) {
    if (this.map.has(node)) {
      return;
    }

    this.map.set(node, writer.inner.name);
    await walkNode(env, node, writer);
  }

  async branch(
    env: Env,
    node: Node,
    parentWriter: TrackedWriter
  ): Promise<string> {
    const name = this.map.get(node);
    if (name != null) {
      return name;
    }

    const writer = new TrackedWriter(
      await parentWriter.inner.createBranch()
    );
    this.map.set(node, writer.inner.name);
    try {
      await walkNode(env, node, writer);
    } finally {
      await writer.inner.close();
    }

    return writer.inner.name;
  }
}
