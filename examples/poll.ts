import { defineMcsFunction, mcsExecute, mcsCmd, mcsOutput } from 'mcslib/builder.js';

export const poll = defineMcsFunction(
  ['number', 'number'],
  (start, end) => {
    mcsExecute(
      mcsCmd`say polled '${mcsOutput(mcsCmd`random value ${start}..${end}`)}' from range ${start}..${end}`
    );
  }
);
