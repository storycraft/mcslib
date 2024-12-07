import { defineMcsFunction, mcsExecute, mcsCmd, mcsExpr, mcsLit } from 'mcslib/builder.js';
import { McsNumber, McsString } from 'mcslib/builder/primitive.js';

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
