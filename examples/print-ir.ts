import { inspect } from 'node:util';
import { IrFunction } from 'mcslib/ir.js';
import { AST_FN } from './print-tree.js';
import { low } from 'mcslib/lowering.js';
import { newResolver } from '@mcslib/builder/ast/type-resolver.js';

export const IR_FN: IrFunction = low(AST_FN, newResolver(AST_FN));

console.log(inspect(
  IR_FN,
  true,
  20,
  true
));
