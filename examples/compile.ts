import { FunctionDir } from '@/mcslib.js';
import { Compiler } from '@/compile.js';
import { draw_star } from './common.js';

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
await compiler.export('example', draw_star);
