import { Fn, FnSig } from '@/ast/fn';
import { IrFunction, Storage, Node, emptyNode } from '..';
import { Expr } from '@/ast/expr';
import { IrVarType } from '../types';
import { visitBlock } from './stmt';
import { visitExpr } from './expr';
import { Id } from '@/ast';
import { Label } from '@/ast/loop';
import { VarType } from '@/ast/types';

/**
 * create intermediate representation of a function
 * @param f function to low
 * @returns ir of the function
 */
export function low(f: Fn): IrFunction {
  const env: Env = {
    sig: f.sig,
    varMap: new VarMap(),
    loop: new LoopStack(),
    storages: [],
  };

  for (const ty of f.sig.args) {
    env.storages.push({ ty });
  }

  const node = emptyNode();
  visitBlock(env, node, f.block);

  return {
    storages: env.storages,
    node,
  };
}

export type Env = {
  sig: FnSig,
  varMap: VarMap,
  loop: LoopStack,
  storages: Storage[],
}

export function newStorage(env: Env, ty: IrVarType): number {
  const index = env.storages.length;
  env.storages.push({ ty });
  return index;
}

export function newStorageInit(
  env: Env,
  node: Node,
  ty: IrVarType,
  expr: Expr,
): number {
  const index = newStorage(env, ty);
  const [exprTy, irExpr] = visitExpr(env, node, expr);

  if (exprTy !== ty) {
    throw `expected type: ${exprTy} got: ${ty}`;
  }

  node.ins.push({
    ins: 'set',
    index,
    expr: irExpr,
  });

  return index;
}

/**
 * Map var id to ir index
 */
export class VarMap {
  private readonly varToIr: Map<number, number> = new Map();
  private readonly varToTy: Map<number, VarType> = new Map();

  register(id: Id, ty: VarType, index: number) {
    if (this.varToIr.has(id.id)) {
      throw `duplicate local entry id: ${id.id}`;
    }

    this.varToIr.set(id.id, index);
    this.varToTy.set(id.id, ty);
  }

  get(id: Id): [VarType, number] {
    const ty = this.varToTy.get(id.id);
    const index = this.varToIr.get(id.id);
    if (index == null || ty == null) {
      throw `unknown local id: ${id.id}`;
    }

    return [ty, index];
  }
}

export type Loop = {
  prevNode: Node,
  loopNode: Node,
  nextNode: Node,
}

/**
 * create loop stack of node and map label to ir node
 */
export class LoopStack {
  private readonly labelToIrNode: Map<string, Loop> = new Map();
  private readonly stack: Loop[] = [];

  enter<T>(
    node: Node,
    f: (loop: Loop) => T,
    label?: Label
  ): T {
    const loopNode = emptyNode();
    loopNode.end = {
      ins: 'jmp',
      next: loopNode,
    };

    node.end = {
      ins: 'jmp',
      next: loopNode,
    };

    const loop: Loop = {
      prevNode: node,
      loopNode,
      nextNode: emptyNode(),
    };
    this.stack.push(loop);

    if (label) {
      if (this.labelToIrNode.has(label.name)) {
        throw `duplicate label name: ${label.name}`;
      }
      this.labelToIrNode.set(label.name, loop);
    }

    try {
      return f(loop);
    } finally {
      this.stack.pop();

      if (label) {
        this.labelToIrNode.delete(label.name);
      }
    }
  }

  /**
   * get top or labelled loop
   * @param label optional label of a loop
   */
  get(label?: Label): Loop {
    if (!label) {
      if (this.stack.length == 0) {
        throw `cannot use outside of loop block`;
      }

      return this.stack[this.stack.length - 1];
    }

    const node = this.labelToIrNode.get(label.name);
    if (!node) {
      throw `cannot find loop label: ${label.name}`;
    }

    return node;
  }
}
