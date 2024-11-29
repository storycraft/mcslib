import { blockScope, fnScope } from '../builder.js';
import { Id } from '@/ast.js';
import { Expr } from '@/ast/expr.js';
import { If } from '@/ast/expr/condition.js';
import { Break, Continue, Loop } from '@/ast/loop.js';
import { CommandTemplate } from '@/ast/stmt.js';
import { VarType } from '@/ast/types.js';

export function mcsVar<const T extends VarType>(ty: T, init: Expr): Id<T> {
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
    blockScope.with({ stmts: stmt.else.stmts }, elseF);
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

export function mcsExecute(...templates: CommandTemplate[]) {
  blockScope.get().stmts.push({
    ast: 'execute',
    templates,
  });
}

export function mcsCmd(arr: TemplateStringsArray, ...exprs: Expr[]): CommandTemplate {
  const template: CommandTemplate = [
    {
      ty: 'text',
      text: arr[0],
    },
  ];

  const length = exprs.length;
  if (length > 0) {
    for (let i = 0; i < length; i++) {
      template.push({
        ty: 'expr',
        expr: exprs[i],
      });

      if (arr[i + 1] !== '') {
        template.push({
          ty: 'text',
          text: arr[i + 1],
        });
      }
    }
  }

  return template;
}
