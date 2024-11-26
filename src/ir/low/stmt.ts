import { If } from '@/ast/expr/condition.js';
import { Stmt, Local, Return, Block, Assign, Command } from '@/ast/stmt.js';
import { Env, newStorage, newStorageInit } from '../low.js';
import { visitExpr } from './expr.js';
import { Break, Continue, Loop } from '@/ast/loop.js';
import { SwitchInt } from '../end.js';
import { Expr } from '@/ast/expr.js';
import { emptyNode, Node } from '../node.js';
import { IR_DEFAULT_CONST } from '../types.js';

export function visitStmt(env: Env, node: Node, stmt: Stmt): Node {
  switch (stmt.ast) {
    case 'block': {
      visitBlock(env, node, stmt);
      break;
    }

    case 'local': {
      visitLocal(env, node, stmt);
      break;
    }

    case 'return': {
      node = visitReturn(env, node, stmt);
      break;
    }

    case 'if': {
      node = visitIf(env, node, stmt);
      break;
    }

    case 'assign': {
      visitAssign(env, node, stmt);
      break;
    }

    case 'loop': {
      node = visitLoop(env, node, stmt);
      break;
    }

    case 'break': {
      node = visitBreak(env, node, stmt);
      break;
    }

    case 'continue': {
      node = visitContinue(env, node, stmt);
      break;
    }

    case 'command': {
      visitCommand(env, node, stmt);
      break;
    }

    default: {
      visitStmtExpr(env, node, stmt);
      break;
    }
  }

  return node;
}

export function visitBlock(env: Env, node: Node, block: Block): Node {
  for (const stmt of block.stmts) {
    node = visitStmt(env, node, stmt);
  }

  return node;
}

function visitLocal(env: Env, node: Node, local: Local) {
  let index;
  if (local.init) {
    index = newStorageInit(env, node, local.ty, local.init);
  } else {
    index = newStorage(env, local.ty);
  }

  env.varMap.register(local.id, local.ty, index);
}

function visitReturn(env: Env, node: Node, ret: Return): Node {
  if (ret.expr) {
    node.end = {
      ins: 'ret',
      ref: {
        expr: 'index',
        index: newStorageInit(
          env,
          node,
          env.sig.returns ?? 'empty',
          ret.expr,
        ),
      },
    };
  } else {
    if (env.sig.returns != null) {
      throw new Error(`cannot return without an expression on ${env.sig.returns} return type`);
    }

    node.end = {
      ins: 'ret',
      ref: IR_DEFAULT_CONST.empty,
    };
  }

  return emptyNode();
}

function visitAssign(env: Env, node: Node, stmt: Assign) {
  const [varTy, index] = env.varMap.get(stmt.id);
  const [exprTy, expr] = visitExpr(env, node, stmt.expr);
  if (exprTy !== varTy) {
    throw new Error(`cannot assign to variable with type: ${varTy} using expression returning ${exprTy}`);
  }
  
  node.ins.push({
    ins: 'assign',
    index,
    expr,
  });
}

function visitIf(env: Env, node: Node, stmt: If): Node {
  const next = emptyNode();

  const ifNode = emptyNode({ ins: 'jmp', next });
  visitBlock(env, ifNode, stmt.block).end = {
    'ins': 'jmp',
    next,
  };

  const switchIns: SwitchInt = {
    ins: 'switch_int',
    index: newStorageInit(env, node, 'number', stmt.condition),
    table: [next],
    default: ifNode,
  };
  node.end = switchIns;

  if (stmt.else) {
    const elseNode = emptyNode({ ins: 'jmp', next });
    switchIns.table[0] = elseNode;
    visitBlock(env, elseNode, stmt.else).end = {
      'ins': 'jmp',
      next,
    };
  }

  return next;
}

function visitLoop(env: Env, node: Node, stmt: Loop): Node {
  return env.loop.enter(
    node,
    (loop) => {
      return visitBlock(env, loop.loopStart, stmt.block);
    },
    stmt.label,
  );
}

function visitBreak(env: Env, node: Node, stmt: Break): Node {
  const loop = env.loop.get(stmt.label);
  node.end = {
    ins: 'jmp',
    next: loop.nextNode,
  };

  return emptyNode();
}

function visitContinue(env: Env, node: Node, stmt: Continue): Node {
  const loop = env.loop.get(stmt.label);
  node.end = {
    ins: 'jmp',
    next: loop.loopStart,
  };

  return emptyNode();
}

function visitCommand(env: Env, node: Node, cmd: Command) {
  node.ins.push({
    ins: 'cmd',
    command: cmd.command,
  });
}

function visitStmtExpr(env: Env, node: Node, expr: Expr) {
  visitExpr(env, node, expr);
}
