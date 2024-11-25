import { Env } from '@/codegen.js';
import { ExprIns, Ins } from '@/ir.js';
import { EndIns } from '@/ir/end.js';
import { Node } from '@/ir/node.js';
import { FunctionWriter } from '@/mcslib.js';
import { storeFromR1 } from './intrinsics.js';

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

}
