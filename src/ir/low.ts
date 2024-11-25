import { Fn, FnSig, McsFunction } from '@/ast/fn.js';
import { IrFunction, Storage, Ref, Origin } from '../ir.js';
import { Expr } from '@/ast/expr.js';
import { IR_DEFAULT_CONST, IrType } from './types.js';
import { visitBlock } from './low/stmt.js';
import { visitExpr } from './low/expr.js';
import { Id } from '@/ast.js';
import { Label } from '@/ast/loop.js';
import { VarType } from '@/ast/types.js';
import { emptyNode, Node } from './node.js';

/**
 * create intermediate representation of a function
 * @param f function to low
 * @returns ir of the function
 */
export function low(f: Fn): IrFunction {
  const [env, ir] = initIr(f);
  ir.node.ins.push({
    ins: 'start',
  });

  finish(env, visitBlock(env, ir.node, f.block));

  return ir;
}

function initIr(f: Fn): [Env, IrFunction] {
  const env: Env = {
    sig: f.sig,
    varMap: new VarMap(),
    loop: new LoopStack(),
    storages: [],
    dependencies: new Set<McsFunction>(),
  };

  const length = f.args.length;
  for (let i = 0; i < length; i++) {
    const ty = f.sig.args[i];
    const index = newStorage(env, ty, 'argument');
    env.varMap.register(f.args[i], ty, index);
  }

  return [env, {
    storages: env.storages,
    node: emptyNode(),
    dependencies: env.dependencies,
  }];
}

function finish(env: Env, last: Node) {
  if (last.end.ins !== 'unreachable') {
    return;
  }

  if (env.sig.returns == null) {
    last.end = {
      ins: 'ret',
      ref: IR_DEFAULT_CONST.empty,
    };
  }
}

export type Env = {
  sig: FnSig,
  varMap: VarMap,
  loop: LoopStack,
  storages: Storage[],
  dependencies: Set<McsFunction>,
}

export function refToIndex(env: Env, node: Node, ref: Ref): number {
  if (ref.expr === 'const') {
    const index = newStorage(env, ref.ty);
    node.ins.push({
      ins: 'assign',
      index,
      expr: ref,
    });
    return index;
  } else {
    return ref.index;
  }
}

export function newStorage(env: Env, ty: IrType, origin: Origin = 'local'): number {
  const index = env.storages.length;
  env.storages.push({ origin, ty });
  return index;
}

export function newStorageInit(
  env: Env,
  node: Node,
  ty: IrType,
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
  private readonly varToIr = new Map<number, number>();
  private readonly varToTy = new Map<number, VarType>();

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
  loopStart: Node,
  nextNode: Node,
}

/**
 * create loop stack of node and map label to ir node
 */
export class LoopStack {
  private readonly labelToIrNode = new Map<string, Loop>();
  private readonly stack: Loop[] = [];

  enter(
    node: Node,
    f: (loop: Loop) => Node,
    label?: Label
  ): Node {
    let loopStart;
    if (node.ins.length === 0) {
      loopStart = node;
    } else {
      loopStart = emptyNode();
      node.end = {
        ins: 'jmp',
        next: loopStart,
      };
    }

    const loop: Loop = {
      loopStart,
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
      f(loop).end = {
        ins: 'jmp',
        next: loopStart,
      };
      return loop.nextNode;
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
