import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './mcslib.js';
import { childrenNodes } from './ir/node.js';
import { allocator, Location } from './codegen/alloc.js';
import { walkNode } from './codegen/node.js';

/**
 * generate functions from ir
 * @param ir 
 * @param writer 
 */
export async function gen(ir: IrFunction, writer: FunctionWriter) {
  const alloc = allocator(ir);
  const env: Env = {
    storages: ir.storages.map(
      (storage, index) => alloc.alloc(index, storage),
    ),
  };

  const list: Promise<void>[] = [];
  const children = childrenNodes(ir.node);
  for (let child = children.pop(); child != null; child = children.pop()) {
    const childWriter = await writer.createBranch();
    list.push(walkNode(env, child, childWriter));

    children.push(...childrenNodes(child));
  }

  await Promise.all(list);
}

export type Env = {
  storages: Location[],
}
