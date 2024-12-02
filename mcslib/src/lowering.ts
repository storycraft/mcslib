import { Fn, FnSig, McsFunction } from '@/fn.js';
import { IrFunction, Index, newConst, ExecuteTemplate } from './ir.js';
import { emptyNode, Node } from './ir/node.js';
import { lowStmt } from './lowering/stmt.js';
import { CommandTemplate, Id, Label } from './ast.js';
import { lowExpr } from './lowering/expr.js';
import { Span } from './span.js';

/**
 * create intermediate representation of a function
 * @param f function to low
 * @returns ir of the function
 */
export function low(f: Fn): IrFunction {
  const [env, ir] = initIr(f);
  const last = lowStmt(env, ir.node, f.block);

  if (last.end.ins === 'unreachable' && env.sig.returns === 'empty') {
    last.end = {
      ins: 'ret',
      span: f.block.span,
      ref: newConst(null, f.block.span),
    };
  }

  ir.locals = env.nextLocalId;
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
    const arg = f.args[i];
    env.varResolver.register(
      arg,
      {
        kind: 'index',
        span: arg.span,
        origin: 'argument',
        index: i,
      }
    );
  }

  return [env, {
    sig: f.sig,
    locals: 0,
    node: emptyNode(),
    dependencies: env.dependencies,
  }];
}

export type Env = {
  sig: FnSig,
  varResolver: VarResolver,
  loop: LoopStack,
  dependencies: Set<McsFunction>,
  nextLocalId: number,
}

export function newStorage(env: Env, span: Span): Index {
  const index = env.nextLocalId++;
  return {
    kind: 'index',
    span,
    origin: 'local',
    index,
  };
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
    span: Span,
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
        span,
        next: loopStart,
      };
    }

    const loop: Loop = {
      loopStart,
      nextNode: emptyNode(),
    };
    this.stack.push(loop);

    if (label != null) {
      if (this.labelToIrNode.has(label.name)) {
        throw new Error(`duplicate label name: ${label.name}`);
      }
      this.labelToIrNode.set(label.name, loop);
    }

    try {
      f(loop).end = {
        ins: 'jmp',
        span,
        next: loopStart,
      };
      return loop.nextNode;
    } finally {
      this.stack.pop();

      if (label != null) {
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

export function parseTemplate(
  env: Env,
  node: Node,
  template: CommandTemplate
): ExecuteTemplate {
  const parts: ExecuteTemplate = [];
  for (const part of template) {
    switch (part.ty) {
      case 'expr': {
        parts.push({ ty: 'ref', ref: lowExpr(env, node, part.expr) });
        break;
      }

      case 'text': {
        parts.push(part);
        break;
      }
    }
  }

  return parts;
}
