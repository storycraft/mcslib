import { FunctionDir } from '@/mcslib.js';
import { Compiler } from '@/compile.js';
import { draw_star } from './common.js';
import { appendFile } from 'fs/promises';

const LOGGING_DIR: FunctionDir = {
  get namespace() {
    return 'example';
  },

  create(name) {
    return Promise.resolve({
      async write(command) {
        await appendFile('examples/boj_2447/data/example/function/' + name + '.mcfunction', command + '\n');
      },
    });
  },
};

const compiler = new Compiler(LOGGING_DIR);
await compiler.export('example', draw_star);
