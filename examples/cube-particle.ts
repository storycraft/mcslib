import { defineMcsFunction, mcsAssign, mcsCmd, mcsExecute, mcsExpr, mcsVar, mcsWhile } from '@/builder.js';

export const cubeParticle = defineMcsFunction(
  ['number', 'number', 'number', 'number'],
  (width, length, height, density) => {
    const xStart = mcsVar('number', mcsExpr`-${width} / 2`);
    const yStart = mcsVar('number', mcsExpr`-${height} / 2`);
    const zStart = mcsVar('number', mcsExpr`-${length} / 2`);

    const y = mcsVar('number', mcsExpr`0`);
    mcsWhile(mcsExpr`${y} < ${height}`, () => {
      const x = mcsVar('number', mcsExpr`0`);
      mcsWhile(mcsExpr`${x} < ${width}`, () => {
        const z = mcsVar('number', mcsExpr`0`);
        mcsWhile(mcsExpr`${z} < ${length}`, () => {
          const pos = [
            mcsExpr`${xStart} + ${x}`,
            mcsExpr`${yStart} + ${y}`,
            mcsExpr`${zStart} + ${z}`
          ];
          mcsExecute(
            mcsCmd`particle minecraft:flame ~${pos[0]} ~${pos[1]} ~${pos[2]} 0 0 0 0 0 force`
          );

          mcsAssign(z, mcsExpr`${z} + ${density}`);
        });

        mcsAssign(x, mcsExpr`${x} + ${density}`);
      });

      mcsAssign(y, mcsExpr`${y} + ${density}`);
    });
  }
);
