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
  fn: (
    ...args: [...{[I in keyof Args]: Id<Args[I]>}]
  ) => void,
  returns: Ret,
): McsFunction<Args, Ret> {
  return {
    args,
    fn,
    returns,
  };
}

export function mcsFunction<
  const Args extends VarType[],
  const Ret extends VarType,
>(
  args: Args,
  f: (...args: [...{[I in keyof Args]: Id<Args[I]>}]) => void,
  ret?: Ret,
): Fn<Args, Ret> {
  const fn: Fn<Args, Ret> = {
    ast: 'fn',
    args,
    ret,
    block: {
      ast: 'block',
      stmts: [],
    },
  };

  fnScope.with({
    varCounter: args.length,
  }, () => {
    blockScope.with({ stmts: fn.block.stmts }, () => {
      (f as (...args: Id[]) => void)(
        ...args.map((_, id) => {
          return { ast: 'id', id } as const;
        })
      );
    });
  });

  return fn;
}
