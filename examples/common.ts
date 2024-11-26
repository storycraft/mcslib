import { mcsAssign, mcsVar, mcsReturn, mcsWhile, mcsExpr, defineMcsFunction, mcsIf, mcsCmd, mcsCall } from '@/builder.js';

export const index4 = defineMcsFunction(
  ['number', 'number', 'number'], (n, x, y) => {
    const m = mcsVar('number', n);
    mcsWhile(mcsExpr`${m} >= ${1}`, () => {
      mcsIf(
        mcsExpr`(${x} / ${m}) % ${3} == ${1} && (${y} / ${m}) % ${3} == ${1}`,
        () => {
          mcsReturn(mcsExpr`${1}`);
        }
      );

      mcsAssign(m, mcsExpr`${m} / 3`);
    });

    mcsReturn(mcsExpr`${0}`);
  },
  'number'
);

export const draw_star = defineMcsFunction(['number'], (n) => {
  const y = mcsVar('number', mcsExpr`${0}`);
  mcsWhile(mcsExpr`${y} < ${n}`, () => {
    mcsCmd('data modify storage example:storage buffer set value []');
    
    const x = mcsVar('number', mcsExpr`${0}`);
    mcsWhile(mcsExpr`${x} < ${n}`, () => {
      mcsIf(
        mcsExpr`${mcsCall(index4, [n, x, y])} == 1`,
        () => {
          mcsCmd('data modify storage example:storage buffer append value "§00"');
        },
        () => {
          mcsCmd('data modify storage example:storage buffer append value "§d#"');
        }
      )

      mcsAssign(x, mcsExpr`${x} + ${1}`);
    });

    mcsCmd('tellraw @s [{"storage": "example:storage", "nbt": "buffer", "interpret": true}]');
    mcsAssign(y, mcsExpr`${y} + ${1}`);
  });
});
