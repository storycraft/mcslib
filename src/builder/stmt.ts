import { blockScope, fnScope } from '.';
import { Id } from '@/ast';
import { Expr } from '@/ast/expr';
import { If } from '@/ast/expr/condition';
import { Break, Continue, Loop } from '@/ast/loop';
import { VarType } from '@/ast/types';

export function mcsVar<const T extends VarType>(ty: T, init?: Expr): Id<T> {
  const id: Id<T> = {
    ast: 'id',
    id: fnScope.get().varCounter++,
  };

  blockScope.get().stmts.push({
    ast: 'local',
    id,
    ty,
    init,
  });
  return id;
}

export function mcsAssign(id: Id, expr: Expr) {
  blockScope.get().stmts.push({
    ast: 'assign',
    id,
    expr,
  });
}

export function mcsIf(condition: Expr, f: () => void, elseF?: () => void) {
  const stmt: If = {
    ast: 'if',
    condition,
    block: {
      ast: 'block',
      stmts: [],
    },
  };

  blockScope.get().stmts.push(stmt);
  blockScope.with({ stmts: stmt.block.stmts }, f);
  if (elseF) {
    stmt.else = {
      ast: 'block',
      stmts: [],
    };
    blockScope.with({ stmts: stmt.else.stmts }, f);
  }
}

export function mcsLoop(f: () => void, label?: string) {
  const stmt: Loop = {
    ast: 'loop',
    block: {
      ast: 'block',
      stmts: [],
    },
  };

  if (label) {
    stmt.label = { ast: 'label', name: label };
  }

  blockScope.get().stmts.push(stmt);
  blockScope.with({ stmts: stmt.block.stmts }, f);
}

export function mcsWhile(condition: Expr, f: () => void, label?: string) {
  mcsLoop(() => {
    mcsIf({
      ast: 'not',
      expr: condition,
    }, () => {
      mcsBreak();
    });

    f();
  }, label);
}

export function mcsContinue(label?: string) {
  const stmt: Continue = {
    ast: 'continue',
  };
  if (label) {
    stmt.label = { ast: 'label', name: label };
  }

  blockScope.get().stmts.push(stmt);
}

export function mcsBreak(label?: string) {
  const stmt: Break = {
    ast: 'break',
  };
  if (label) {
    stmt.label = { ast: 'label', name: label };
  }

  blockScope.get().stmts.push(stmt);
}

export function mcsReturn(expr?: Expr) {
  blockScope.get().stmts.push({
    ast: 'return',
    expr,
  });
}

export function mcsStmt(expr: Expr) {
  blockScope.get().stmts.push(expr);
}

export function mcsCmd(command: string) {
  blockScope.get().stmts.push({
    ast: 'command',
    command,
  });
}
