import { Fn } from '@/ast/fn';
import { IrFunction } from '.';

export function low(
  f: Fn,
): IrFunction {
  const irFn: IrFunction = {
    locals: f.sig.args.map(ty => {
      return { ty };
    }),
    start: {
      ins: [],
    },
  };

  return irFn;
}
