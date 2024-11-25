import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './mcslib.js';
import { allocator, Location } from './codegen/alloc.js';
import { NodeMap, walkNode } from './codegen/node.js';
import { initStackFrame } from './codegen/intrinsics.js';
import { McsFunction } from './ast/fn.js';

/**
 * generate functions from ir
 * @param ir 
 * @param linkMap
 * @param writer 
 */
export async function gen(
  ir: IrFunction,
  linkMap: Map<McsFunction, string>,
  writer: FunctionWriter
) {
  const alloc = allocator(ir);
  const env: Env = {
    storages: ir.storages.map(
      (storage, index) => alloc.alloc(index, storage),
    ),
    stackSize: alloc.stackSize,
    nodeMap: new NodeMap(ir.node, writer.name),
    linkMap,
  };

  await initStackFrame(env.stackSize, writer);
  await walkNode(env, ir.node, writer);
}

export type Env = {
  storages: Location[],
  stackSize: number,
  nodeMap: NodeMap,
  linkMap: Map<McsFunction, string>,
}
