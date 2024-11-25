import { gen } from '@/codegen.js';
import { FunctionDir, FunctionWriter } from '@/mcslib.js';
import { IR_FN } from './ir.js';
import { McsFunction } from '@/ast/fn.js';
import { tree } from './common.js';

const LOGGING_WRITER: FunctionDir = {
  get namespace() {
    return 'example';
  },

  create(name) {
    return Promise.resolve({
      write(command) {
        console.log(`[emit] f: ${name} | ${command}`);
        return Promise.resolve();
      },
    });
  },
};

const MAP = new Map<McsFunction, string>().set(tree, 'example:example');

await gen(
  IR_FN,
  MAP,
  await FunctionWriter.create(
    LOGGING_WRITER,
    'example',
  ),
);
