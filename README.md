This project is WIP and does not work yet.

# `mcslib`: Minecraft command script library
`mcslib` is structural programming language coded using javascript, compiles into minecraft datapack.

## Example
Hand ported solution of [baekjoon #2447](https://www.acmicpc.net/problem/2447) from the c language code.
[![boj 2447](https://raw.githubusercontent.com/storycraft/mcslib/main/assets/boj_2447.mp4)](https://raw.githubusercontent.com/storycraft/mcslib/main/assets/boj_2447.mp4)

## Detail
### Data type
Currently mcslib only supports `number` (double precision float) type, like javascript's `number` type.

### operator
`+`, `-`, `*`, `%`, `>`, `<`, `>=`, `<=`, `==`, `!=` operators are supported.
Bitwise operations are not supported since they can be emulated and very slow anyways.
Comparison operators use predicates internally and very fast.

Remainder operator works correctly only if they were integer.

### function
Functions can receive arguments and return a value.
Size of the stack frame is calculated on compile time.

They uses mcslib's ABI. It's not compatible with datapack function's arguments and return value.
Exported functions are compatible with datapack function
However compiler can create compatible function if you export them.

### control flow statements
`if`, `while`, `loop` statements are supported.
