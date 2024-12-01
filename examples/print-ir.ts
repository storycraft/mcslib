import { inspect } from 'node:util';
import { IrFunction } from 'mcslib/ir.js';
import { AST_FN } from './print-tree.js';
import { low } from 'mcslib/lowering.js';

export const IR_FN: IrFunction = low(AST_FN);

console.log(inspect(
  IR_FN,
  true,
  20,
  true
));
