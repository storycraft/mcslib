import { Env } from '@/codegen.js';
import { ExecuteTemplate, Rvalue, Ins } from '@/ir.js';
import { EndIns } from '@/ir/end.js';
import { Node } from '@/ir/node.js';
import { FunctionWriter } from '@/lib.js';
import { arithmetic as binary, bool, call, cmp, disposeStackFrame, load, loadConst, loadLocation, NAMESPACE, neg, not, STACK, storeFromR1 } from './intrinsics.js';

export async function walkNode(env: Env, node: Node, writer: FunctionWriter) {
  for (const ins of node.ins) {
    await walkIns(env, ins, writer);
  }

  await walkEndIns(env, node.end, writer);
}

async function walkIns(env: Env, ins: Ins, writer: FunctionWriter) {
  switch (ins.ins) {
    case 'assign': {
      await walkExpr(env, ins.rvalue, writer);
      await storeFromR1(env.alloc.resolve(ins.index), writer);
      break;
    }

    case 'execute': {
      let executeWriter: FunctionWriter;

      const hasRefs = ins.template.some(({ ty }) => ty === 'ref');
      if (hasRefs) {
        executeWriter = await writer.createBranch();
        await writer.write(
          `function ${executeWriter.namespace}:${executeWriter.name} with storage ${NAMESPACE} ${STACK}[-1]`
        );
      } else {
        executeWriter = writer;
      }

      try {
        await writeTemplate(env, ins.template, executeWriter);
      } finally {
        await executeWriter.close();
      }
      break;
    }
  }
}

async function writeTemplate(
  env: Env,
  template: ExecuteTemplate,
  writer: FunctionWriter
) {
  let macro = false;
  let cmd = '';
  for (const part of template) {
    switch (part.ty) {
      case 'ref': {
        const ref = part.ref;

        if (ref.kind === 'const') {
          cmd += JSON.stringify(ref.value);
        } else {
          if (!macro) {
            macro = true;
          }

          const loc = env.alloc.resolve(ref);
          if (loc.at !== 'local') {
            throw new Error('Execute ref must be allocated in local');
          }
          cmd += `$(l${loc.index})`;
        }
        break;
      }

      case 'text': {
        cmd += part.text;
        break;
      }
    }
  }

  if (cmd !== '') {
    if (macro) {
      await writer.write(`$${cmd}`);
    } else {
      await writer.write(cmd);
    }
  }
}

async function walkExpr(env: Env, ins: Rvalue, writer: FunctionWriter) {
  switch (ins.kind) {
    case 'index':
    case 'const': {
      await load(env, ins, 1, writer);
      break;
    }

    case 'binary': {
      await binary(env, ins.op, ins.left, ins.right, writer);
      break;
    }

    case 'neg': {
      await neg(env, ins.operand, writer);
      break;
    }

    case 'call': {
      const fullName = env.linkMap.get(ins.f);
      if (fullName == null) {
        throw new Error(`Function ${ins.f.buildFn} cannot be found from the link map`);
      }

      await call(env, fullName, ins.args, writer);
      break;
    }

    case 'cmp': {
      await cmp(env, ins.op, ins.left, ins.right, writer);
      break;
    }

    case 'bool': {
      await bool(env, ins.op, ins.left, ins.right, writer);
      break;
    }

    case 'not': {
      await not(env, ins.operand, writer);
      break;
    }

    default: {
      break;
    }
  }
}

async function walkEndIns(env: Env, ins: EndIns, writer: FunctionWriter) {
  switch (ins.ins) {
    case 'jmp': {
      const name = await env.nodeMap.branch(env, ins.next, writer);
      await writer.write(
        `function ${writer.namespace}:${name}`
      );
      break;
    }

    case 'switch_int': {
      await loadLocation(env.alloc.resolve(ins.index), 1, writer);

      const length = ins.table.length;
      if (length === 1 && ins.table[0]) {
        const name = await env.nodeMap.branch(env, ins.table[0], writer);
        await writer.write(
          `execute if predicate mcs_intrinsic:zero run return run function ${writer.namespace}:${name}`
        );
      } else {
        for (let i = 0; i < length; i++) {
          const target = ins.table[i];
          if (!target) {
            continue;
          }

          const name = await env.nodeMap.branch(env, target, writer);
          await loadConst(i, 2, writer);
          await writer.write(
            `execute if predicate mcs_intrinsic:eq run return run function ${writer.namespace}:${name}`
          );
        }
      }

      await env.nodeMap.expand(env, ins.default, writer);
      break;
    }

    case 'ret': {
      await load(env, ins.ref, 1, writer);
      await disposeStackFrame(env.alloc.stackSize, writer);
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
    writer: FunctionWriter
  ) {
    if (this.map.has(node)) {
      return;
    }

    this.map.set(node, writer.name);
    await walkNode(env, node, writer);
  }

  async branch(
    env: Env,
    node: Node,
    parentWriter: FunctionWriter
  ): Promise<string> {
    const name = this.map.get(node);
    if (name != null) {
      return name;
    }

    const writer = await parentWriter.createBranch();
    this.map.set(node, writer.name);
    try {
      await walkNode(env, node, writer);
    } finally {
      await writer.close();
    }

    return writer.name;
  }
}
