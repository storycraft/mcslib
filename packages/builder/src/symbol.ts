export const McsSymbol = {
  serialize: Symbol('McsSymbol.serialize'),

  add: Symbol('McsSymbol.add'),
  sub: Symbol('McsSymbol.sub'),
  mul: Symbol('McsSymbol.mul'),
  div: Symbol('McsSymbol.div'),
  remi: Symbol('McsSymbol.remi'),

  iterable: Symbol('McsSymbol.iterable'),

  call: Symbol('McsSymbol.call'),
} as {
  readonly serialize: unique symbol,

  readonly add: unique symbol,
  readonly sub: unique symbol,
  readonly mul: unique symbol,
  readonly div: unique symbol,
  readonly remi: unique symbol,

  readonly iterable: unique symbol,

  readonly call: unique symbol,
};
