import { Stmt } from './ast.js';
import { Fn, FnSig, McsBuildFn, McsFunction } from './fn.js';
import { callSite } from './span.js';
import { create, Store } from './store.js';
import { VarType } from './types.js';

export * from './builder/stmt.js';
export * from './builder/expr.js';

export type FnScope = {
  varCounter: number,
}

export type BlockScope = {
  stmts: Stmt[],
}

export const fnScope: Store<FnScope> = create();

export const blockScope: Store<BlockScope> = create();

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
    span: callSite(),
    sig: {
      args,
      returns,
    },
    buildFn,
  };
}

export function build<const Sig extends FnSig>(fn: McsFunction<Sig>): Fn<Sig> {
  const span = callSite();
  const item: Fn<Sig> = {
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

  fnScope.with({
    varCounter: fn.sig.args.length,
  }, () => {
    blockScope.with({ stmts: item.block.stmts }, () => {
      fn.buildFn(...item.args);
    });
  });

  return item;
}
