import { draw_star } from './draw-star.js';
import { cubeParticle } from './cube-particle.js';
import { DatapackWriter } from '@mcslib/datapack';
import { createReadStream, createWriteStream } from 'fs';
import { poll } from './poll.js';

const path = 'example_pack.zip';
const writer = new DatapackWriter('example', createWriteStream(path));

await writer.addStream('pack.mcmeta', createReadStream('./examples/pack.mcmeta'));
if (
  await writer.export({
    name: 'draw_star',
    fn: draw_star,
    args: ['size'],
  })
) {
  console.log(`exported draw_star function`);
}

if (
  await writer.export({
    name: 'cube_particle',
    fn: cubeParticle,
    args: ['particle', 'width', 'length', 'height', 'density'],
  })
) {
  console.log(`exported cube_particle function`);
}

if (
  await writer.export({
    name: 'poll',
    fn: poll,
    args: ['start', 'end'],
  })
) {
  console.log(`exported poll function`);
}

await writer.finish();

console.log(`Datapack generated at ${path}`);
