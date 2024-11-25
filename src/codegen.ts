import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './mcslib.js';
import { childrenNodes, Node } from './ir/node.js';

/**
 * generate functions from ir
 * @param ir 
 * @param writer 
 */
export async function gen(ir: IrFunction, writer: FunctionWriter) {
  const list: Promise<void>[] = [];

  const children = childrenNodes(ir.node);
  for (let child = children.pop(); child != null; child = children.pop()) {
    const childWriter = await writer.createBranch();
    list.push(walkNode(ir, child, childWriter));

    children.push(...childrenNodes(child));
  }

  await Promise.all(list);
}

export type Env = {
  storages: Storage[],
}

async function walkNode(ir: IrFunction, node: Node, writer: FunctionWriter) {
  
}
