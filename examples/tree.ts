import { build } from '@/builder';
import { inspect } from 'node:util';
import { tree } from './common';

console.log(inspect(build(tree), true, 10, true));
