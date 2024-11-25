import { gen } from '@/codegen.js';
import { FunctionDir, FunctionWriter } from '@/mcslib.js';
import { IR_FN } from './ir.js';

const LOGGING_WRITER: FunctionDir = {
  create(name) {
    return Promise.resolve({
      write(command) {
        console.log(`[emit] f: ${name} | ${command}`);
        return Promise.resolve();
      },
    });
  },
};

await gen(
  IR_FN,
  await FunctionWriter.create(
    LOGGING_WRITER,
    'example',
  ),
);
