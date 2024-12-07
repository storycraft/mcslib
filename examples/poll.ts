import { defineMcsFunction, mcsExecute, mcsCmd, mcsOutput, mcsVar, mcsLit } from 'mcslib/builder.js';
import { McsNumber, McsString } from 'mcslib/builder/primitive.js';

export const poll = defineMcsFunction(
  [McsNumber, McsNumber],
  (start, end) => {
    const prefix = mcsVar(McsString, mcsLit('polled'));
    mcsExecute(
      mcsCmd`say ${prefix} '${mcsOutput(mcsCmd`random value ${start}..${end}`)}' from range ${start}..${end}`
    );
  }
);
