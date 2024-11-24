import { Fn, FnSig } from '@/ast/fn';
import { IrFunction, Storage, Ref } from '..';
import { Expr } from '@/ast/expr';
import { IrVarType } from '../types';
import { visitBlock } from './stmt';
import { visitExpr } from './expr';
import { Id } from '@/ast';
import { Label } from '@/ast/loop';
import { VarType } from '@/ast/types';
import { emptyNode, Node, traverseNode } from '../node';

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

  const length = f.args.length;
  const args = new Array(length);
  for (let i = 0; i < length; i++) {
    const ty = f.sig.args[i];
    const index = newStorage(env, ty);
    env.varMap.register(f.args[i], ty, index);
    args[i] = index;
  }

  const node = emptyNode();
  visitBlock(env, node, f.block);

  traverseNode(node, (node) => {
    if (node.end.ins !== 'unreachable') {
      return;
    }

    if (f.sig.returns == null) {
      node.end = {
        ins: 'ret',
        index: newStorage(env, 'empty'),
      };
    } else {
      throw new Error(`function with return type ${f.sig.returns} ended without returning`);
    }
  });

  return {
    args,
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

export function refToIndex(env: Env, node: Node, ref: Ref): number {
  if (ref.expr === 'const') {
    const index = newStorage(env, ref.ty);
    node.ins.push({
      ins: 'set',
      index,
      expr: ref,
    });
    return index;
  } else {
    return ref.index;
  }
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
  const [exprTy, ref] = visitExpr(env, node, expr);

  if (exprTy !== ty) {
    throw new Error(`expected type: ${exprTy} got: ${ty}`);
  }

  return refToIndex(env, node, ref);
}

/**
 * Map var id to ir index
 */
export class VarMap {
  private readonly varToIr: Map<number, number> = new Map();
  private readonly varToTy: Map<number, VarType> = new Map();

  register(id: Id, ty: VarType, index: number) {
    if (this.varToIr.has(id.id)) {
      throw new Error(`multiple local variable declaration. id: ${id.id}`);
    }

    this.varToIr.set(id.id, index);
    this.varToTy.set(id.id, ty);
  }

  get(id: Id): [VarType, number] {
    const ty = this.varToTy.get(id.id);
    const index = this.varToIr.get(id.id);
    if (index == null || ty == null) {
      throw new Error(`local variable id: ${id.id} is not defined`);
    }

    return [ty, index];
  }
}

export type Loop = {
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
      loopNode,
      nextNode: emptyNode(),
    };
    this.stack.push(loop);

    if (label) {
      if (this.labelToIrNode.has(label.name)) {
        throw new Error(`duplicate label name: ${label.name}`);
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
        throw new Error(`cannot use outside of loop block`);
      }

      return this.stack[this.stack.length - 1];
    }

    const node = this.labelToIrNode.get(label.name);
    if (!node) {
      throw new Error(`cannot find loop label: ${label.name}`);
    }

    return node;
  }
}
