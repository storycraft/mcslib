import { build } from '@/builder.js';
import { inspect } from 'node:util';
import { tree } from './common.js';
import { Fn } from '@/ast/fn.js';

export const AST_FN: Fn = build(tree);

console.log(inspect(AST_FN, true, 10, true));
