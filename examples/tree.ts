import { build } from '@/builder.js';
import { inspect } from 'node:util';
import { draw_star } from './common.js';
import { Fn } from '@/ast/fn.js';

export const AST_FN: Fn = build(draw_star);

console.log(inspect(AST_FN, true, 20, true));
