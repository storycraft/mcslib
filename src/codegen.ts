import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './mcslib.js';
import { Alloc, alloc } from './codegen/alloc.js';
import { NodeMap, walkNode } from './codegen/node.js';
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
  const env: Env = {
    alloc: alloc(ir),
    nodeMap: new NodeMap(ir.node, writer.name),
    linkMap,
  };

  await walkNode(env, ir.node, writer);
}

export type Env = {
  alloc: Alloc,
  nodeMap: NodeMap,
  linkMap: Map<McsFunction, string>,
}
