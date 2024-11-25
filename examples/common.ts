import { mcsAssign, mcsVar, mcsReturn, mcsWhile, mcsExpr, defineMcsFunction } from '@/builder.js';

export const tree = defineMcsFunction(['number', 'number'], (a, b) => {
  const c = mcsVar('number', mcsExpr`${50}`);
  mcsWhile(mcsExpr`${a} == ${b}`, () => {
    mcsReturn(mcsExpr`${100}`);
  });

  mcsAssign(c, mcsExpr`${a} + ${b} * -${15}`);

  mcsReturn(c);
}, 'number');
