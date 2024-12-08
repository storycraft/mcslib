import { Stmt } from './ast.js';
import { McsEmpty } from './primitive.js';
import { VarType } from './var.js';
import { Fn, CallArgs, FnSig, McsBuildFn, McsFunction } from './fn.js';
import { diagnostic, Diagnostic, Span } from '@mcslib/core';
import { create, Store } from './store.js';

export * from './fn.js';
export * from './stmt.js';
export * from './expr.js';

export type FnScope = {
  varCounter: number,
  diagnostics: Diagnostic[],
}

export type BlockScope = {
  stmts: Stmt[],
}

export const FN_SCOPE: Store<FnScope> = create();
export const BLOCK_SCOPE: Store<BlockScope> = create();

export function defineMcsFunction<
  const Args extends VarType[]
>(
  args: Args,
  buildFn: McsBuildFn<Args>
): McsFunction<FnSig<Args, typeof McsEmpty>>;

export function defineMcsFunction<
  const Args extends VarType[],
  const Ret extends VarType,
>(
  args: Args,
  buildFn: McsBuildFn<Args>,
  returns: Ret,
): McsFunction<FnSig<Args, Ret>>;

export function defineMcsFunction(
  args: VarType[],
  buildFn: McsBuildFn,
  returns: VarType = McsEmpty,
): McsFunction {
  return {
    span: Span.callSite(1),
    sig: {
      args,
      returns,
    },
    buildFn,
  };
}

export type Result<Sig extends FnSig> = {
  f: Fn<Sig>,
  diagnostics: Diagnostic[],
}

export class BuilderError {
  constructor(
    public readonly span: Span,
    public readonly message: string,
  ) { }
}

export function build<const Sig extends FnSig>(fn: McsFunction<Sig>): Result<Sig> {
  const span = Span.callSite(1);

  const f: Fn<Sig> = {
    span,
    args: fn.sig.args.map((constructor, id) => {
      return new constructor(id, span);
    }) as CallArgs<Sig['args']>,
    sig: fn.sig,
    block: {
      kind: 'block',
      span,
      stmts: [],
    },
  };

  const diagnostics: Diagnostic[] = [];
  FN_SCOPE.with({
    varCounter: fn.sig.args.length,
    diagnostics,
  }, () => {
    BLOCK_SCOPE.with({ stmts: f.block.stmts }, () => {
      try {
        fn.buildFn(...f.args);
      } catch (e) {
        if (e instanceof BuilderError) {
          diagnostics.push(
            diagnostic('error', e.message, e.span),
          );
        } else {
          throw e;
        }
      }
    });
  });

  return {
    f,
    diagnostics,
  };
}
