import { Stmt } from './ast.js';
import { Fn, FnSig, McsBuildFn, McsFunction } from './fn.js';
import { create, Store } from './store.js';

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

export function defineMcsFunction<
  const Sig extends FnSig,
>(
  args: Sig['args'],
  buildFn: McsBuildFn<Sig>,
  returns?: Sig['returns'],
): McsFunction<Sig> {
  return {
    sig: {
      args,
      returns,
    } as Sig,
    buildFn,
  };
}

export function build<const Sig extends FnSig>(fn: McsFunction<Sig>): Fn<Sig> {
  const item: Fn<Sig> = {
    args: fn.sig.args.map((_, id) => {
      return { kind: 'id', id } as const;
    }),
    sig: fn.sig,
    block: {
      kind: 'block',
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
