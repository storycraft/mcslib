import { Stmt } from './ast.js';
import { diagnostic, Diagnostic } from './diagnostic.js';
import { Fn, FnSig, McsBuildFn, McsFunction } from './fn.js';
import { callSite, Span } from './span.js';
import { create, Store } from './store.js';
import { VarType } from './types.js';

export * from './builder/stmt.js';
export * from './builder/expr.js';

export type FnScope = {
  varCounter: number,
  diagnostics: Diagnostic[],
}

export type BlockScope = {
  stmts: Stmt[],
}

export const FN_SCOPE: Store<FnScope> = create();
export const BLOCK_SCOPE: Store<BlockScope> = create();

export function defineMcsFunction<const Args extends VarType[]>(
  args: Args,
  buildFn: McsBuildFn<FnSig<Args, 'empty'>>
): McsFunction<FnSig<Args, 'empty'>>;

export function defineMcsFunction<
  const Args extends VarType[],
  const Ret extends VarType,
>(
  args: Args,
  buildFn: McsBuildFn<FnSig<Args, Ret>>,
  returns: Ret,
): McsFunction<FnSig<Args, Ret>>;

export function defineMcsFunction(
  args: VarType[],
  buildFn: McsBuildFn<FnSig>,
  returns: VarType = 'empty',
): McsFunction {
  return {
    span: callSite(1),
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
  const span = callSite(1);

  const f: Fn<Sig> = {
    span,
    args: fn.sig.args.map((_, id) => {
      return { kind: 'id', span, id } as const;
    }),
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
