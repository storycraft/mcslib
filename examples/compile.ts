import { FunctionDir } from '@/mcslib.js';
import { Compiler } from '@/compile.js';
import { tree } from './common.js';

const LOGGING_DIR: FunctionDir = {
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

const compiler = new Compiler(LOGGING_DIR);
await compiler.export('example', tree);
