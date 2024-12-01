import { Fn, FnSig, McsFunction } from '@/fn.js';
import { IrFunction, Ref, Index, newConst } from './ir.js';
import { emptyNode, Node } from './ir/node.js';
import { lowStmt } from './lowering/stmt.js';
import { Expr, Id, Label } from './ast.js';
import { lowExpr } from './lowering/expr.js';

/**
 * create intermediate representation of a function
 * @param f function to low
 * @returns ir of the function
 */
export function low(f: Fn): IrFunction {
  const [env, ir] = initIr(f);
  finish(env, lowStmt(env, ir.node, f.block));
  return ir;
}


function initIr(f: Fn): [Env, IrFunction] {
  const env: Env = {
    sig: f.sig,
    varResolver: new VarResolver(),
    loop: new LoopStack(),
    dependencies: new Set<McsFunction>(),
    nextLocalId: 0,
  };

  const length = f.args.length;
  for (let i = 0; i < length; i++) {
    env.varResolver.register(
      f.args[i],
      {
        kind: 'index',
        origin: 'argument',
        index: i,
      }
    );
  }

  return [env, {
    sig: f.sig,
    locals: env.nextLocalId,
    node: emptyNode(),
    dependencies: env.dependencies,
  }];
}

function finish(env: Env, last: Node) {
  if (last.end.ins !== 'unreachable') {
    return;
  }

  if (env.sig.returns === 'empty') {
    last.end = {
      ins: 'ret',
      ref: newConst(null),
    };
  }
}

export type Env = {
  sig: FnSig,
  varResolver: VarResolver,
  loop: LoopStack,
  dependencies: Set<McsFunction>,
  nextLocalId: number,
}

export function refToIndex(env: Env, node: Node, ref: Ref): Index {
  if (ref.kind === 'const') {
    const index = newStorage(env);
    node.ins.push({
      ins: 'assign',
      index,
      rvalue: ref,
    });
    return index;
  } else {
    return ref;
  }
}

export function newStorage(env: Env): Index {
  const index = env.nextLocalId++;
  return {
    kind: 'index',
    origin: 'local',
    index,
  };
}

export function newStorageInit(
  env: Env,
  node: Node,
  expr: Expr,
): Index {
  const ref = lowExpr(env, node, expr);
  return refToIndex(env, node, ref);
}

/**
 * Map var id to ir index
 */
export class VarResolver {
  private readonly map = new Map<number, Index>();

  register(id: Id, index: Index) {
    if (this.map.has(id.id)) {
      throw new Error(`multiple local variable declaration. id: ${id.id}`);
    }

    this.map.set(id.id, index);
  }

  resolve(id: Id): Index  {
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
