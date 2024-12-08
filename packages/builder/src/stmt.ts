import { BLOCK_SCOPE, FN_SCOPE } from './lib.js';
import { Break, CommandTemplate, Continue, Expr, Id, If, Loop } from './ast.js';
import { Span } from '@mcslib/core';
import { VarType } from './var.js';
import { AstType } from './ast/type.js';

export function mcsVar<
  const T extends Id,
>(constructor: VarType<T>, init?: Expr): T {
  const span = Span.callSite(1);

  const id = new constructor(FN_SCOPE.get().varCounter++, span);
  const stmts = BLOCK_SCOPE.get().stmts;
  stmts.push({
    kind: 'local',
    span,
    id,
    type: constructor.type,
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
  BLOCK_SCOPE.get().stmts.push({
    kind: 'assign',
    span: Span.callSite(1),
    id,
    expr,
  });
}

export function mcsIf(condition: Expr, f: () => void, elseF?: () => void) {
  const span = Span.callSite(1);
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

  BLOCK_SCOPE.get().stmts.push(stmt);
  BLOCK_SCOPE.with({ stmts: stmt.block.stmts }, f);
  if (elseF) {
    stmt.else = {
      kind: 'block',
      span,
      stmts: [],
    };
    BLOCK_SCOPE.with({ stmts: stmt.else.stmts }, elseF);
  }
}

export function mcsLoop(f: () => void, label?: string) {
  const span = Span.callSite(1);
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

  BLOCK_SCOPE.get().stmts.push(stmt);
  BLOCK_SCOPE.with({ stmts: stmt.block.stmts }, f);
}

export function mcsWhile(condition: Expr, f: () => void, label?: string) {
  mcsLoop(() => {
    mcsIf({
      kind: 'unary',
      span: Span.callSite(1),
      op: '!',
      operand: condition,
    }, () => {
      mcsBreak();
    });

    f();
  }, label);
}

export function mcsContinue(label?: string) {
  const stmt: Continue = {
    kind: 'continue',
    span: Span.callSite(1),
  };
  if (label) {
    stmt.label = { name: label };
  }

  BLOCK_SCOPE.get().stmts.push(stmt);
}

export function mcsBreak(label?: string) {
  const stmt: Break = {
    kind: 'break',
    span: Span.callSite(1),
  };
  if (label) {
    stmt.label = { name: label };
  }

  BLOCK_SCOPE.get().stmts.push(stmt);
}

export function mcsReturn(expr?: Expr) {
  BLOCK_SCOPE.get().stmts.push({
    kind: 'return',
    expr,
    span: Span.callSite(1),
  });
}

export function mcsStmt(expr: Expr) {
  BLOCK_SCOPE.get().stmts.push({
    kind: 'expr',
    expr,
    span: Span.callSite(1),
  });
}

export function mcsExecute(...templates: CommandTemplate[]) {
  BLOCK_SCOPE.get().stmts.push({
    kind: 'execute',
    templates,
    span: Span.callSite(1),
  });
}

export function mcsCmd(arr: TemplateStringsArray, ...exprs: Expr[]): CommandTemplate {
  const template: CommandTemplate = [
    {
      part: 'text',
      text: arr[0],
    },
  ];

  const length = exprs.length;
  if (length > 0) {
    for (let i = 0; i < length; i++) {
      template.push({
        part: 'expr',
        expr: exprs[i],
      });

      if (arr[i + 1] !== '') {
        template.push({
          part: 'text',
          text: arr[i + 1],
        });
      }
    }
  }

  return template;
}

export function mcsIntrinsic(
  name: string,
  macro: boolean,
  arg_types: AstType[],
  args: Expr[],
  out?: Id
) {
  BLOCK_SCOPE.get().stmts.push({
    kind: 'intrinsic',
    span: Span.callSite(1),
    name,
    macro,
    arg_types,
    args,
    out,
  });
}
