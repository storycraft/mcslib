import { Call } from '@/ast/fn';
import { Expr } from '@/ast/expr';
import { parseExpr, Term } from './parse';

type ExprArg = number | Expr;

export function mcsExpr(
    arr: TemplateStringsArray,
    ...args: [ExprArg, ...ExprArg[]]
): Expr {
    const terms: Term[] = [];
    const length = args.length;
    for (let i = 0; i < length; i++) {
        if (arr[i] !== '') {
            for (const value of arr[i].trim().split(' ')) {
                terms.push({
                    ty: 'token',
                    value,
                });
            }
        }

        const arg = args[i];
        if (typeof arg === 'number') {
            terms.push({
                ty: 'expr',
                value: {
                    ast: 'number',
                    value: arg,
                },
            });
        } else {
            terms.push({
                ty: 'expr',
                value: arg,
            });
        }
    }

    return parseExpr({
        terms,
        index: 0,
    });
}

