import { Env, newStorageInit } from '../lowering.js';
import { lowExpr } from './expr.js';
import { acceptStmt, StmtVisitor } from '@/ast/visit.js';
import { Local, Return, If, Break, Continue, CommandTemplate, Stmt, Assign, Loop, Execute } from '@/ast.js';
import { emptyNode, Node } from '@/ir/node.js';
import { IR_DEFAULT_CONST } from '@/ir/types.js';
import { SwitchInt } from '@/ir/end.js';
import { ExecuteTemplate } from '@/ir.js';

export function lowStmt(env: Env, node: Node, stmt: Stmt): Node {
  const visitor = new StmtLowVisitor(env, node);
  acceptStmt(stmt, visitor);
  return visitor.node;
}

class StmtLowVisitor implements StmtVisitor {
  constructor(
    private readonly env: Env,
    public node: Node,
  ) { }

  visitLocal(stmt: Local): boolean {
    this.env.varResolver.register(
      stmt.id,
      stmt.ty,
      newStorageInit(this.env, this.node, stmt.ty, stmt.init)
    );

    return false;
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const [ty, ref] = lowExpr(this.env, this.node, stmt.expr);
      if (ty !== this.env.sig.returns) {
        throw new Error(
          `invalid return value expected: ${this.env.sig.returns ?? 'empty'} got: ${ty}`
        );
      }

      this.node.end = {
        ins: 'ret',
        ref,
      };
    } else {
      if (this.env.sig.returns != null) {
        throw new Error(
          `cannot return without an expression on ${this.env.sig.returns} return type`
        );
      }

      this.node.end = {
        ins: 'ret',
        ref: IR_DEFAULT_CONST.empty,
      };
    }

    this.node = emptyNode();
    return false;
  }

  visitAssign(stmt: Assign): boolean {
    const [varTy, index] = this.env.varResolver.resolve(stmt.id);
    const [exprTy, expr] = lowExpr(this.env, this.node, stmt.expr);
    if (exprTy !== varTy) {
      throw new Error(`cannot assign to variable with type: ${varTy} using expression returning ${exprTy}`);
    }

    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: expr,
    });

    return false;
  }

  visitIf(stmt: If): boolean {
    const next = emptyNode();

    const ifNode = emptyNode({ ins: 'jmp', next });
    lowStmt(this.env, ifNode, stmt.block).end = {
      'ins': 'jmp',
      next,
    };

    const switchIns: SwitchInt = {
      ins: 'switch_int',
      index: newStorageInit(this.env, this.node, 'number', stmt.condition),
      table: [next],
      default: ifNode,
    };
    this.node.end = switchIns;

    if (stmt.else) {
      const elseNode = emptyNode({ ins: 'jmp', next });
      switchIns.table[0] = elseNode;
      lowStmt(this.env, elseNode, stmt.else).end = {
        'ins': 'jmp',
        next,
      };
    }

    this.node = next;
    return false;
  }

  visitLoop(stmt: Loop): boolean {
    this.node = this.env.loop.enter(
      this.node,
      (loop) => {
        return lowStmt(this.env, loop.loopStart, stmt.block);
      },
      stmt.label,
    );

    return false;
  }

  visitBreak(stmt: Break): boolean {
    const loop = this.env.loop.get(stmt.label);
    this.node.end = {
      ins: 'jmp',
      next: loop.nextNode,
    };

    this.node = emptyNode();
    return false;
  }

  visitContinue(stmt: Continue): boolean {
    const loop = this.env.loop.get(stmt.label);
    this.node.end = {
      ins: 'jmp',
      next: loop.loopStart,
    };

    this.node = emptyNode();
    return false;
  }

  visitExecute(stmt: Execute): boolean {
    this.node.ins.push({
      ins: 'execute',
      template: parseTemplate(this.env, this.node, stmt.template),
    });

    return false;
  }
}

function parseTemplate(
  env: Env,
  node: Node,
  template: CommandTemplate
): ExecuteTemplate {
  const parts: ExecuteTemplate = [];
  for (const part of template) {
    switch (part.ty) {
      case 'expr': {
        const [, ref] = lowExpr(env, node, part.expr);
        parts.push({ ty: 'ref', ref });
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
