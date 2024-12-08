import { build } from '@mcslib/builder';
import { inspect } from 'node:util';
import { draw_star } from './draw-star.js';

export const AST_FN = build(draw_star).f;

console.log(inspect(AST_FN, true, 20, true));
