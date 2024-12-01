import { Env, newStorage } from '../lowering.js';
import { lowExpr } from './expr.js';
import { acceptStmt, StmtVisitor } from '@/ast/visit.js';
import { Local, Return, If, Break, Continue, CommandTemplate, Stmt, Assign, Loop, Execute } from '@/ast.js';
import { emptyNode, Node } from '@/ir/node.js';
import { SwitchInt } from '@/ir/end.js';
import { ExecuteTemplate, newConst } from '@/ir.js';
import { DEFAULT_CONST } from '@/types.js';

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
      newStorage(this.env)
    );

    return true;
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const ref = lowExpr(this.env, this.node, stmt.expr);
      this.node.end = {
        ins: 'ret',
        ref,
      };
    } else {
      this.node.end = {
        ins: 'ret',
        ref: newConst(DEFAULT_CONST.empty),
      };
    }

    this.node = emptyNode();
    return true;
  }

  visitAssign(stmt: Assign): boolean {
    const index = this.env.varResolver.resolve(stmt.id);
    const expr = lowExpr(this.env, this.node, stmt.expr);

    this.node.ins.push({
      ins: 'assign',
      index,
      rvalue: expr,
    });

    return true;
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
      ref: lowExpr(this.env, this.node, stmt.condition),
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
    return true;
  }

  visitLoop(stmt: Loop): boolean {
    this.node = this.env.loop.enter(
      this.node,
      (loop) => {
        return lowStmt(this.env, loop.loopStart, stmt.block);
      },
      stmt.label,
    );

    return true;
  }

  visitBreak(stmt: Break): boolean {
    const loop = this.env.loop.get(stmt.label);
    this.node.end = {
      ins: 'jmp',
      next: loop.nextNode,
    };

    this.node = emptyNode();
    return true;
  }

  visitContinue(stmt: Continue): boolean {
    const loop = this.env.loop.get(stmt.label);
    this.node.end = {
      ins: 'jmp',
      next: loop.loopStart,
    };

    this.node = emptyNode();
    return true;
  }

  visitExecute(stmt: Execute): boolean {
    this.node.ins.push({
      ins: 'execute',
      template: parseTemplate(this.env, this.node, stmt.template),
    });

    return true;
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
