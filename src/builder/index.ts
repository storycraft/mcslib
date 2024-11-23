import { Id } from '../ast';
import { Fn, McsFunction } from '../ast/fn';
import { create, Store } from '../store';
import { VarType } from '../ast/types';
import { Stmt } from '../ast/stmt';

export * from './stmt';
export * from './expr';

export type FnScope = {
  varCounter: number,
}

export type BlockScope = {
  stmts: Stmt[],
}

export const fnScope: Store<FnScope> = create();

export const blockScope: Store<BlockScope> = create();

export function defineMcsFunction<
  const Args extends VarType[],
  const Ret extends VarType,
>(
  args: Args,
  buildFn: (
    ...args: [...{[I in keyof Args]: Id<Args[I]>}]
  ) => void,
  returns?: Ret,
): McsFunction<Args, Ret> {
  return {
    sig: {
      args,
      returns,
    },
    buildFn,
  };
}

export function build<
  const Args extends VarType[],
  const Ret extends VarType,
>(fn: McsFunction<Args, Ret>): Fn<Args, Ret> {
  const item: Fn<Args, Ret> = {
    ast: 'fn',
    args: fn.sig.args.map((_, id) => {
      return { ast: 'id', id } as const;
    }),
    sig: fn.sig,
    block: {
      ast: 'block',
      stmts: [],
    },
  };

  fnScope.with({
    varCounter: fn.sig.args.length,
  }, () => {
    blockScope.with({ stmts: item.block.stmts }, () => {
      (fn.buildFn as (...args: Id[]) => void)(...item.args);
    });
  });

  return item;
}
