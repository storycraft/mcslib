import { FunctionDir } from '@/mcslib.js';
import { Compiler } from '@/compile.js';
import { draw_star } from './star.js';
import { open, writeFile } from 'fs/promises';
import { cubeParticle } from './cube-particle.js';

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
await compiler.export({
  name: 'example',
  fn: draw_star,
  args: ['size'],
});
console.log(`exported example function`);
await compiler.export({
  name: 'cube_particle',
  fn: cubeParticle,
  args: ['width', 'length', 'height', 'density'],
});
console.log(`exported cube_particle function`);
