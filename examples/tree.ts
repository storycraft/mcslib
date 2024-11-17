import { mcsAssign, mcsFunction, mcsVar, mcsReturn, mcsWhile, mcsExpr } from '@/builder';
import { inspect } from 'node:util';

const fn = mcsFunction(['number', 'number'] as const, (a, b) => {
    const c = mcsVar('number', mcsExpr`${50}`);
    mcsWhile(mcsExpr`${a} == ${b}`, () => {
        mcsReturn(mcsExpr`${100}`);
    });

    mcsAssign(c, mcsExpr`${a} + ${b} + -${15}`);

    mcsReturn(c);
}, 'number');

console.log(inspect(fn, true, 10, true));
