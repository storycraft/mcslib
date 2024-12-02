import { blockScope, fnScope } from '../builder.js';
import { Break, CommandTemplate, Continue, Expr, Id, If, Loop } from '@/ast.js';
import { callSite } from '@/span.js';
import { VarType } from '@/types.js';

export function mcsVar<const T extends VarType>(ty: T, init?: Expr): Id<T> {
  const span = callSite();
  const id: Id<T> = {
    kind: 'id',
    span,
    id: fnScope.get().varCounter++,
  };

  const stmts = blockScope.get().stmts;
  stmts.push({
    kind: 'local',
    span,
    id,
    ty,
  });
  if (init) {
    stmts.push({
      kind: 'assign',
      span,
      id,
      expr: init,
    });
  }

  return id;
}

export function mcsAssign(id: Id, expr: Expr) {
  blockScope.get().stmts.push({
    kind: 'assign',
    span: callSite(),
    id,
    expr,
  });
}

export function mcsIf(condition: Expr, f: () => void, elseF?: () => void) {
  const span = callSite();
  const stmt: If = {
    kind: 'if',
    span,
    condition,
    block: {
      kind: 'block',
      span,
      stmts: [],
    },
  };

  blockScope.get().stmts.push(stmt);
  blockScope.with({ stmts: stmt.block.stmts }, f);
  if (elseF) {
    stmt.else = {
      kind: 'block',
      span,
      stmts: [],
    };
    blockScope.with({ stmts: stmt.else.stmts }, elseF);
  }
}

export function mcsLoop(f: () => void, label?: string) {
  const span = callSite();
  const stmt: Loop = {
    kind: 'loop',
    span,
    block: {
      kind: 'block',
      span,
      stmts: [],
    },
  };

  if (label) {
    stmt.label = { name: label };
  }

  blockScope.get().stmts.push(stmt);
  blockScope.with({ stmts: stmt.block.stmts }, f);
}

export function mcsWhile(condition: Expr, f: () => void, label?: string) {
  mcsLoop(() => {
    mcsIf({
      kind: 'unary',
      span: callSite(),
      op: '!',
      expr: condition,
    }, () => {
      mcsBreak();
    });

    f();
  }, label);
}

export function mcsContinue(label?: string) {
  const stmt: Continue = {
    kind: 'continue',
    span: callSite(),
  };
  if (label) {
    stmt.label = { name: label };
  }

  blockScope.get().stmts.push(stmt);
}

export function mcsBreak(label?: string) {
  const stmt: Break = {
    kind: 'break',
    span: callSite(),
  };
  if (label) {
    stmt.label = { name: label };
  }

  blockScope.get().stmts.push(stmt);
}

export function mcsReturn(expr?: Expr) {
  blockScope.get().stmts.push({
    kind: 'return',
    expr,
    span: callSite(),
  });
}

export function mcsStmt(expr: Expr) {
  blockScope.get().stmts.push({
    kind: 'expr',
    expr,
    span: callSite(),
  });
}

export function mcsExecute(template: CommandTemplate) {
  blockScope.get().stmts.push({
    kind: 'execute',
    template,
    span: callSite(),
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
