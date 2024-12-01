import { IrFunction } from '@/ir.js';
import { FunctionWriter } from './lib.js';
import { Alloc, alloc } from './emit/alloc.js';
import { NodeMap, walkNode } from './emit/node.js';
import { McsFunction } from './fn.js';

/**
 * emit functions from ir
 * @param ir 
 * @param linkMap
 * @param writer 
 */
export async function emit(
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
