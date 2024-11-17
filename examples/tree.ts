import { mcsAssign, mcsVar, mcsReturn, mcsWhile, mcsExpr, defineMcsFunction, build } from '@/builder';
import { inspect } from 'node:util';

const tree = defineMcsFunction(['number', 'number'], (a, b) => {
  const c = mcsVar('number', mcsExpr`${50}`);
  mcsWhile(mcsExpr`${a} == ${b}`, () => {
    mcsReturn(mcsExpr`${100}`);
  });

  mcsAssign(c, mcsExpr`${a} + ${b} + -${15}`);

  mcsReturn(c);
}, 'number');

console.log(inspect(build(tree), true, 10, true));
