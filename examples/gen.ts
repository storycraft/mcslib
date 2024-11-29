import { draw_star } from './draw-star.js';
import { cubeParticle } from './cube-particle.js';
import { DatapackWriter } from '@mcslib/datapack/src/lib.js';
import { createReadStream, createWriteStream } from 'fs';

const path = 'example_pack.zip';
const writer = new DatapackWriter('example', createWriteStream(path));

await writer.addStream('pack.mcmeta', createReadStream('./examples/pack.mcmeta'));
await writer.export({
  name: 'draw_star',
  fn: draw_star,
  args: ['size'],
});
console.log(`exported draw_star function`);

await writer.export({
  name: 'cube_particle',
  fn: cubeParticle,
  args: ['width', 'length', 'height', 'density'],
});
console.log(`exported cube_particle function`);

await writer.finish();

console.log(`Datapack generated at ${path}`);
