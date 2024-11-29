import { inspect } from 'node:util';
import { low } from 'mcslib/ir/low.js';
import { IrFunction } from 'mcslib/ir.js';
import { AST_FN } from './tree.js';

export const IR_FN: IrFunction = low(AST_FN);

console.log(inspect(
  IR_FN,
  true,
  20,
  true
));
