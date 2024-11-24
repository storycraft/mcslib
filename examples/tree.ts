import { build } from '@/builder.js';
import { inspect } from 'node:util';
import { tree } from './common.js';

console.log(inspect(build(tree), true, 10, true));
