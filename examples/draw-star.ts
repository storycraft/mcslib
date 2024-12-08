// Port of baekjoon #2447 c solution

import { mcsAssign, mcsVar, mcsReturn, mcsWhile, mcsExpr, defineMcsFunction, mcsIf, mcsExecute, mcsCall, mcsCmd, mcsLit } from '@mcslib/builder';
import { McsNumber, McsString } from '@mcslib/builder/primitive.js';

export const index4 = defineMcsFunction(
  [McsNumber, McsNumber, McsNumber], (n, x, y) => {
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
  McsNumber
);

export const draw_star = defineMcsFunction([McsNumber], (n) => {
  const y = mcsVar(McsNumber, mcsExpr`0`);
  mcsWhile(mcsExpr`${y} < ${n}`, () => {
    const line = mcsVar(McsString, mcsLit(''));
    const x = mcsVar(McsNumber, mcsExpr`0`);
    mcsWhile(mcsExpr`${x} < ${n}`, () => {
      mcsIf(
        mcsExpr`${mcsCall(index4, [n, x, y])} == 1`,
        () => {
          mcsAssign(line, mcsExpr`${line} + ${mcsLit('§00')}`);
        },
        () => {
          mcsAssign(line, mcsExpr`${line} + ${mcsLit('§d#')}`);
        }
      )

      mcsAssign(x, mcsExpr`${x} + 1`);
    });

    mcsExecute(
      mcsCmd`tellraw @s {"text":"${line}"}`
    );
    mcsAssign(y, mcsExpr`${y} + 1`);
  });
});
