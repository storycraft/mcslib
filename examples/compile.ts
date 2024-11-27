import { FunctionDir } from '@/mcslib.js';
import { Compiler } from '@/compile.js';
import { draw_star } from './common.js';
import { open, writeFile } from 'fs/promises';

const EXAMPLE_DIR: FunctionDir = {
  get namespace() {
    return 'example';
  },

  async create(name) {
    const handle = await open(
      `examples/boj_2447/data/example/function/${name}.mcfunction`,
      'w'
    );

    return {
      async write(command) {
        await writeFile(handle, command + '\n');
      },

      async close() {
        await handle.close();
      }
    };
  },
};

const compiler = new Compiler(EXAMPLE_DIR);
console.log(`exported ${await compiler.export('example', draw_star)} function`);
