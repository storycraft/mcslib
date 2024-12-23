import { defineMcsFunction, mcsExecute, mcsCmd, mcsLit } from '@mcslib/builder';
import { McsNumber, McsString } from '@mcslib/builder/primitive.js';

export const numberMethods = defineMcsFunction(
  [McsNumber],
  (num) => {
    mcsExecute(
      mcsCmd`say number: ${num}`,
      mcsCmd`say floor: ${num.floor()}`,
      mcsCmd`say round: ${num.round()}`,
      mcsCmd`say ceil: ${num.ceil()}`,
      mcsCmd`say abs: ${num.abs()}`,
      mcsCmd`say recip: ${num.recip()}`,
      mcsCmd`say sign: ${num.sign()}`,
      mcsCmd`say max(5): ${num.max(mcsLit(5))}`,
      mcsCmd`say min(5): ${num.min(mcsLit(5))}`,
    );
  }
);

export const stringMethods = defineMcsFunction(
  [McsString],
  (str) => {
    mcsExecute(
      mcsCmd`say string: ${str}`,
      mcsCmd`say length: ${str.length}`,
      mcsCmd`say slice(0, 5): ${str.slice(mcsLit(0), mcsLit(5))}`,
      mcsCmd`say slice(6): ${str.slice(mcsLit(6))}`
    );
  }
);
