This project is WIP and may contains a lot of unreported bugs.

# `mcslib`: Minecraft command script library
`mcslib` is structural programming language coded using javascript, compiles into minecraft datapack.

## Example
Compiled solution of [baekjoon #2447](https://www.acmicpc.net/problem/2447).
Ported from the c language code.

https://github.com/user-attachments/assets/2acdf2be-6b0c-423d-bba6-ecfe8ab5c7f9

See script code from `examples/common.ts`

Run example files using
```bash
npm start --example=<example_name>
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
