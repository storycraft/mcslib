import { Block, ConstNumber, Id } from '../ast';
import { Fn } from '../ast/fn';
import { create, Store } from '../store';
import { VarType } from '../ast/types';
import { Local, Stmt } from '../ast/stmt';
import { Expr } from '../ast/expr';

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

export function mcsFunction<const Args extends VarType[]>(
    args: Args,
        f: (...params: [...{[I in keyof Args]: Id}]) => void,
    ret?: VarType,
): Fn {
    const fn: Fn = {
        ast: 'fn',
        args: args.map((ty, id) => {
            return {
                ast: 'local',
                id: { ast: 'id', id },
                ty,
            };
        }),
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
                ...fn.args.map(arg => arg.id)
            );
        });
    });

    return fn;
}
