import { build } from '@/builder.js';
import { inspect } from 'node:util';
import { tree } from './common.js';
import { low } from '@/ir/low.js';

console.log(inspect(
  low(build(tree)),
  true,
  20,
  true
));
