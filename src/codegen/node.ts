import { Env } from '@/codegen.js';
import { ExprIns, Ins } from '@/ir.js';
import { EndIns } from '@/ir/end.js';
import { Node } from '@/ir/node.js';
import { FunctionWriter } from '@/mcslib.js';
import { load, loadConstNumber, loadIndex, storeFromR1 } from './intrinsics.js';

export async function walkNode(env: Env, node: Node, writer: FunctionWriter) {
  for (const ins of node.ins) {
    await walkIns(env, ins, writer);
  }

  await walkEndIns(env, node.end, writer);
}

async function walkIns(env: Env, ins: Ins, writer: FunctionWriter) {
  switch (ins.ins) {
    case 'set': {
      await walkExpr(env, ins.expr, writer);
      await storeFromR1(env.storages[ins.index], writer);
      break;
    }

    case 'cmd': {
      await writer.write(ins.command);
      break;
    }
  }
}

async function walkExpr(env: Env, ins: ExprIns, writer: FunctionWriter) {

}

async function walkEndIns(env: Env, ins: EndIns, writer: FunctionWriter) {
  switch (ins.ins) {
    case 'jmp': {
      const childWriter = await writer.createBranch();
      await writer.write(
        `function ${writer.namespace}:${childWriter.name}`
      );

      await walkNode(env, ins.next, childWriter);
      break;
    }

    case 'switch_int': {
      const queue: Promise<void>[] = [];

      await loadIndex(env, ins.index, 1, writer);

      const length = ins.table.length;
      for (let i = 0; i < length; i++) {
        const target = ins.table[i];
        if (!target) {
          continue;
        }
        const tableWriter = await writer.createBranch();

        await loadConstNumber(env, i, 2, writer);
        await writer.write(
          `execute if predicate mcs_intrinsic:eq run return run function ${writer.namespace}:${tableWriter.name}`
        );

        queue.push(walkNode(env, ins.default, tableWriter));
      }

      const defaultWriter = await writer.createBranch();
      await writer.write(
        `function ${writer.namespace}:${defaultWriter.name}`
      );
      queue.push(walkNode(env, ins.default, defaultWriter));

      await Promise.all(queue);
      break;
    }

    case 'ret': {
      await load(env, ins.ref, 1, writer);
      break;
    }

    case 'unreachable': {
      throw new Error('Reached unreachable ended node');
    }
  }
}
