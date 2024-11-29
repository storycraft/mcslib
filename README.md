[![NPM Version (with dist tag)](https://img.shields.io/npm/v/mcslib/latest)](https://www.npmjs.com/package/mcslib)
# `mcslib`: Minecraft command script library
`mcslib` is structural programming language coded using javascript, compiles into minecraft datapack.

## Example
### example:draw_star
Source codes in `examples/draw-star.ts`
![Draw star example preview](./assets/draw_star.png)

### example:cube_particle
Source codes in `examples/cube-particle.ts`
![Cube particle example preview](./assets/cube_particle.png)


Compile example using
```bash
npm start --example=compile
```

## Detail
### Data type
Currently mcslib only supports `number` (double precision float) type, like javascript's `number` type.

### operator
`+`, `-`, `*`, `/`, `%`, `>`, `<`, `>=`, `<=`, `==`, `!=` operators are supported.  
Bitwise operations are not supported since they can be emulated and very slow anyways.  
Comparison operators use predicates internally and very fast.

Remainder operator works correctly only if they were integer.

### function
Functions can receive arguments and return a value.
Size of the stack frame is calculated on compile time.

They uses mcslib's ABI. It's not compatible with minecraft function's arguments and return value.

Compiler will creates compatible function if you export them.

### control flow statements
`if`, `while`, `loop` statements are supported.
