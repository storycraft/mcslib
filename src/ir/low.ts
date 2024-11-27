import { Fn, FnSig, McsFunction } from '@/ast/fn.js';
import { IrFunction, Storage, Ref, Index } from '../ir.js';
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
    varResolver: new VarResolver(),
    loop: new LoopStack(),
    storage: {
      arguments: f.sig.args,
      locals: [],
    },
    dependencies: new Set<McsFunction>(),
  };

  const length = f.args.length;
  for (let i = 0; i < length; i++) {
    env.varResolver.register(
      f.args[i],
      f.sig.args[i],
      {
        expr: 'index',
        origin: 'argument',
        index: i,
      }
    );
  }

  return [env, {
    storage: env.storage,
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
  varResolver: VarResolver,
  loop: LoopStack,
  storage: Storage,
  dependencies: Set<McsFunction>,
}

export function refToIndex(env: Env, node: Node, ref: Ref): Index {
  if (ref.expr === 'const') {
    const index = newStorage(env, ref.ty);
    node.ins.push({
      ins: 'assign',
      index,
      expr: ref,
    });
    return index;
  } else {
    return ref;
  }
}

export function newStorage(env: Env, ty: IrType): Index {
  const index = env.storage.locals.length;
  env.storage.locals.push(ty);
  return {
    expr: 'index',
    origin: 'local',
    index,
  };
}

export function newStorageInit(
  env: Env,
  node: Node,
  ty: IrType,
  expr: Expr,
): Index {
  const [exprTy, ref] = visitExpr(env, node, expr);
  if (exprTy !== ty) {
    throw new Error(`expected type: ${exprTy} got: ${ty}`);
  }

  return refToIndex(env, node, ref);
}

export type TypedRef = [IrType, Ref];

/**
 * Map var id to ir index
 */
export class VarResolver {
  private readonly map = new Map<number, [VarType, Index]>();

  register(id: Id, ty: VarType, index: Index) {
    if (this.map.has(id.id)) {
      throw new Error(`multiple local variable declaration. id: ${id.id}`);
    }

    this.map.set(id.id, [ty, index]);
  }

  resolve(id: Id): [VarType, Index]  {
    const item = this.map.get(id.id);
    if (item == null) {
      throw new Error(`local variable id: ${id.id} is not defined`);
    }

    return item;
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
