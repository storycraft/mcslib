import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './mcslib.js';
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

  await walkNode(env, ir.node, writer);
}

export type Env = {
  storages: Location[],
}
