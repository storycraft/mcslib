import { Env, newStorage, parseTemplate } from '../lowering.js';
import { lowExpr } from './expr.js';
import { acceptStmt, StmtVisitor } from '@/ast/visit.js';
import { Local, Return, If, Break, Continue, Stmt, Assign, Loop, Execute, Intrinsic } from '@/ast.js';
import { emptyNode, Node } from '@/ir/node.js';
import { SwitchInt } from '@/ir/end.js';
import { newConst } from '@/ir.js';

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
    this.env.varMap.register(
      stmt.id,
      newStorage(this.env, stmt.span)
    );

    return true;
  }

  visitReturn(stmt: Return): boolean {
    if (stmt.expr) {
      const ref = lowExpr(this.env, this.node, stmt.expr);
      this.node.end = {
        ins: 'ret',
        span: stmt.span,
        ref,
      };
    } else {
      this.node.end = {
        ins: 'ret',
        span: stmt.span,
        ref: newConst('empty', '', stmt.span),
      };
    }

    this.node = emptyNode();
    return true;
  }

  visitAssign(stmt: Assign): boolean {
    const index = this.env.varMap.get(stmt.id);
    const expr = lowExpr(this.env, this.node, stmt.expr);

    this.node.ins.push({
      ins: 'assign',
      span: stmt.span,
      index,
      rvalue: expr,
    });
    return true;
  }

  visitIf(stmt: If): boolean {
    const condition = stmt.condition;
    if (condition.kind === 'literal') {
      if (condition.value === 0) {
        if (stmt.else) {
          acceptStmt(stmt.else, this);
        }
      } else {
        acceptStmt(stmt.block, this);
      }

      return true;
    }

    const next = emptyNode();
    const ifNode = emptyNode({ ins: 'jmp', span: stmt.span, next });
    lowStmt(this.env, ifNode, stmt.block).end = {
      ins: 'jmp',
      span: stmt.span,
      next,
    };

    const switchIns: SwitchInt = {
      ins: 'switch_int',
      span: stmt.span,
      ref: lowExpr(this.env, this.node, condition),
      table: [next],
      default: ifNode,
    };
    this.node.end = switchIns;

    if (stmt.else) {
      const elseNode = emptyNode({ ins: 'jmp', span: stmt.span, next });
      switchIns.table[0] = elseNode;
      lowStmt(this.env, elseNode, stmt.else).end = {
        ins: 'jmp',
        span: stmt.span,
        next,
      };
    }

    this.node = next;
    return true;
  }

  visitLoop(stmt: Loop): boolean {
    this.node = this.env.loop.enter(
      this.node,
      stmt.span,
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
      span: stmt.span,
      next: loop.nextNode,
    };

    this.node = emptyNode();
    return true;
  }

  visitContinue(stmt: Continue): boolean {
    const loop = this.env.loop.get(stmt.label);
    this.node.end = {
      ins: 'jmp',
      span: stmt.span,
      next: loop.loopStart,
    };

    this.node = emptyNode();
    return true;
  }

  visitExecute(stmt: Execute): boolean {
    this.node.ins.push({
      ins: 'execute',
      span: stmt.span,
      templates: stmt.templates.map(
        template => parseTemplate(this.env, this.node, template)
      ),
    });

    return true;
  }

  visitIntrinsic(stmt: Intrinsic): boolean {
    this.node.ins.push({
      ins: 'intrinsic',
      span: stmt.span,
      name: stmt.name,
      macro: stmt.macro,
      out: stmt.out ? this.env.varMap.get(stmt.out) : undefined,
      args: stmt.args.map(expr => lowExpr(this.env, this.node, expr)),
    });
    return true;
  }
}
