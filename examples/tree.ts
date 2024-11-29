import { build } from 'mcslib/builder';
import { inspect } from 'node:util';
import { draw_star } from './draw-star.js';
import { Fn } from 'mcslib/ast/fn';

export const AST_FN: Fn = build(draw_star);

console.log(inspect(AST_FN, true, 20, true));
