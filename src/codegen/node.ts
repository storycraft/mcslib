import { Env } from '@/codegen.js';
import { ExprIns, Ins } from '@/ir.js';
import { EndIns } from '@/ir/end.js';
import { Node } from '@/ir/node.js';
import { FunctionWriter } from '@/mcslib.js';
import { arithmetic, bool, call, cmp, disposeStackFrame, load, loadConstNumber, loadIndex, neg, not, storeFromR1 } from './intrinsics.js';

export async function walkNode(env: Env, node: Node, writer: FunctionWriter) {
  for (const ins of node.ins) {
    await walkIns(env, ins, writer);
  }

  await walkEndIns(env, node.end, writer);
}

async function walkIns(env: Env, ins: Ins, writer: FunctionWriter) {
  switch (ins.ins) {
    case 'assign': {
      await walkExpr(env, ins.expr, writer);
      await storeFromR1(env.storages[ins.index], writer);
      break;
    }

    case 'cmd': {
      await writer.write(ins.command);
      break;
    }

    case 'start': {
      break;
    }
  }
}

async function walkExpr(env: Env, ins: ExprIns, writer: FunctionWriter) {
  switch (ins.expr) {
    case 'index':
    case 'const': {
      await load(env, ins, 1, writer);
      break;
    }

    case 'arith': {
      await arithmetic(env, ins.op, ins.left, ins.right, writer);
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
      await loadIndex(env, ins.index, 1, writer);

      const length = ins.table.length;
      if (length === 1 && ins.table[0]) {
        const target = ins.table[0];
        const name = await env.nodeMap.branch(env, target, writer);
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
          await loadConstNumber(i, 2, writer);
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
      await disposeStackFrame(env.stackSize, writer);
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
    await walkNode(env, node, writer);

    return writer.name;
  }
}
