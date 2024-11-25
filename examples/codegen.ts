import { inspect } from 'node:util';
import { gen } from '@/codegen.js';
import { FunctionDir, FunctionWriter } from '@/mcslib.js';
import { IR_FN } from './ir.js';

const LOGGING_WRITER: FunctionDir = {
  create(name) {
    return Promise.resolve({
      write(command) {
        console.log(`f: ${name} command: ${command}`);
        return Promise.resolve();
      },
    });
  },
};

console.log(inspect(
  gen(
    IR_FN,
    await FunctionWriter.create(
      LOGGING_WRITER,
      'example',
    ),
  ),
  true,
  20,
  true
));
