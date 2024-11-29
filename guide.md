
## Data type
Currently the only supported data type is `number` (double precision float) type, like javascript's `number` type.

## Operator
Bitwise operations are not supported since they can be emulated and very slow anyways.  
### Arithmetic
1. `+`: Addition
2. `-`: Subtraction or Negative
3. `*`: Multiplication
4. `/`: Division
5. `%`: Remainder (**integers** only)

> [!IMPORTANT]
> Due to limitations addition and subtraction results cannot exceed 19999999

> [!IMPORTANT]
> Due to limitations multiplication and division results are 32 bit precision

### Comparison
1. `>`: Greater than
2. `<`: Less than
3. `>=`: Greater or equal
4. `<=`: Less or equal
5. `==`: Equal
6. `!=`: Not equal
7. `!`: Not

## Function
Functions can receive arguments and return a value.
They uses mcslib's ABI. It's not compatible with minecraft function arguments and return value.

When exporting, a function with the specified function name and argument names is created.
Exported functions can be called with Minecraft function arguments.

### Function calling convention
1. Caller creates a stack frame object inside storage `mcs:system` `stack`
2. Fill function arguments
3. Call the function
4. Callee uses stack frame to allocate local variables and temporaries
5. Remove stack frame object before return

## Control flow statements
`if`, `while`, `loop` statements are supported.
