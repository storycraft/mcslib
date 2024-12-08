import { defineMcsFunction, mcsAssign, mcsCmd, mcsExecute, mcsExpr, mcsVar, mcsWhile } from '@mcslib/builder';
import { McsNumber, McsString } from '@mcslib/builder/primitive.js';

export const cubeParticle = defineMcsFunction(
  [McsString, McsNumber, McsNumber, McsNumber, McsNumber],
  (particle, width, length, height, density) => {
    const xStart = mcsVar(McsNumber, mcsExpr`-${width} / 2`);
    const yStart = mcsVar(McsNumber, mcsExpr`-${height} / 2`);
    const zStart = mcsVar(McsNumber, mcsExpr`-${length} / 2`);

    const y = mcsVar(McsNumber, mcsExpr`0`);
    mcsWhile(mcsExpr`${y} <= ${height}`, () => {
      const x = mcsVar(McsNumber, mcsExpr`0`);
      mcsWhile(mcsExpr`${x} <= ${width}`, () => {
        const z = mcsVar(McsNumber, mcsExpr`0`);
        mcsWhile(mcsExpr`${z} <= ${length}`, () => {
          const pos = [
            mcsExpr`${xStart} + ${x}`,
            mcsExpr`${yStart} + ${y}`,
            mcsExpr`${zStart} + ${z}`
          ];
          mcsExecute(
            mcsCmd`particle ${particle} ~${pos[0]} ~${pos[1]} ~${pos[2]} 0 0 0 0 0 force`
          );

          mcsAssign(z, mcsExpr`${z} + ${density}`);
        });

        mcsAssign(x, mcsExpr`${x} + ${density}`);
      });

      mcsAssign(y, mcsExpr`${y} + ${density}`);
    });
  }
);
