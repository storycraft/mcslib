import { Fn, FnSig, McsFunction } from '@/fn.js';
import { IrFunction, Index, newConst, ExecuteTemplate, Rvalue, Ref } from './ir.js';
import { emptyNode, Node } from './ir/node.js';
import { lowStmt } from './lowering/stmt.js';
import { CommandTemplate, Id, Label } from './ast.js';
import { lowExpr } from './lowering/expr.js';
import { Span } from './span.js';
import { TypeResolver } from './ast/type-resolver.js';

/**
 * create intermediate representation of a function
 * @param f function to low
 * @param resolver Type resolver of the function
 * @returns ir of the function
 */
export function low(f: Fn, resolver: TypeResolver): IrFunction {
  const varMap = new VarMap();
  f.args.forEach((arg, index) => {
    varMap.register(
      arg,
      {
        kind: 'index',
        span: arg.span,
        origin: 'argument',
        index,
      },
    );
  });

  const env: Env = {
    sig: f.sig,
    resolver,
    varMap,
    loop: new LoopStack(),
    dependencies: new Set<McsFunction>(),
    nextLocalId: f.args.length,
  };
  const node = emptyNode();

  const last = lowStmt(env, node, f.block);
  if (last.end.ins === 'unreachable' && env.sig.returns.type === 'empty') {
    last.end = {
      ins: 'ret',
      span: f.block.span,
      ref: newConst('empty', '', f.block.span),
    };
  }

  return {
    sig: f.sig,
    locals: env.nextLocalId,
    node: node,
    dependencies: env.dependencies,
  };
}

export type Env = {
  sig: FnSig,
  resolver: TypeResolver,
  varMap: VarMap,
  loop: LoopStack,
  dependencies: Set<McsFunction>,
  nextLocalId: number,
}

export function rvalueToRef(env: Env, node: Node, rvalue: Rvalue): Ref {
  if (rvalue.kind === 'index' || rvalue.kind === 'const') {
    return rvalue;
  }

  const index = newStorage(env, rvalue.span);
  node.ins.push({
    ins: 'assign',
    span: rvalue.span,
    index,
    rvalue,
  });
  return index;
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
export class VarMap {
  private readonly map = new Map<number, Index>();

  register(id: Id, index: Index) {
    if (this.map.has(id.id)) {
      throw new Error(`multiple local variable declaration. id: ${id.id}`);
    }

    this.map.set(id.id, index);
  }

  get(id: Id): Index {
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
    switch (part.part) {
      case 'expr': {
        parts.push({ part: 'ref', ref: lowExpr(env, node, part.expr) });
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
