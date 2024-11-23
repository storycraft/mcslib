import { build } from '@/builder';
import { inspect } from 'node:util';
import { tree } from './common';
import { low } from '@/ir/low';

console.log(inspect(
  low(build(tree)),
  true,
  10,
  true
));
