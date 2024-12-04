import { defineMcsFunction, mcsExecute, mcsCmd, mcsOutput, mcsVar, mcsLit } from 'mcslib/builder.js';

export const poll = defineMcsFunction(
  ['number', 'number'],
  (start, end) => {
    const prefix = mcsVar('string', mcsLit('polled'));
    mcsExecute(
      mcsCmd`say ${prefix} '${mcsOutput(mcsCmd`random value ${start}..${end}`)}' from range ${start}..${end}`
    );
  }
);
