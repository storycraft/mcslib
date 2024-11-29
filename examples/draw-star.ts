// Port of baekjoon #2447 c solution

import { mcsAssign, mcsVar, mcsReturn, mcsWhile, mcsExpr, defineMcsFunction, mcsIf, mcsExecute, mcsCall, mcsCmd } from 'mcslib/builder.js';

export const index4 = defineMcsFunction(
  ['number', 'number', 'number'], (n, x, y) => {
    mcsWhile(mcsExpr`${n} >= 1`, () => {
      mcsIf(
        mcsExpr`(${x} / ${n}) % 3 == 1 && (${y} / ${n}) % 3 == 1`,
        () => {
          mcsReturn(mcsExpr`1`);
        }
      );

      mcsAssign(n, mcsExpr`${n} / 3`);
    });

    mcsReturn(mcsExpr`0`);
  },
  'number'
);

export const draw_star = defineMcsFunction(['number'], (n) => {
  const y = mcsVar('number', mcsExpr`0`);
  mcsWhile(mcsExpr`${y} < ${n}`, () => {
    mcsExecute(mcsCmd`data modify storage example:storage buffer set value []`);

    const x = mcsVar('number', mcsExpr`0`);
    mcsWhile(mcsExpr`${x} < ${n}`, () => {
      mcsIf(
        mcsExpr`${mcsCall(index4, [n, x, y])} == 1`,
        () => {
          mcsExecute(mcsCmd`data modify storage example:storage buffer append value "§00"`);
        },
        () => {
          mcsExecute(mcsCmd`data modify storage example:storage buffer append value "§d#"`);
        }
      )

      mcsAssign(x, mcsExpr`${x} + 1`);
    });

    mcsExecute(
      mcsCmd`tellraw @s {"storage": "example:storage", "nbt": "buffer", "interpret": true}`
    );
    mcsAssign(y, mcsExpr`${y} + 1`);
  });
});
