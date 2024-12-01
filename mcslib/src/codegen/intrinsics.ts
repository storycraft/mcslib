import { FunctionWriter } from '@/lib.js';
import { Location } from './alloc.js';
import { Env } from '@/codegen.js';
import { Binary, Ref, Unary } from '@/ir.js';
import { Primitive } from '@/types.js';

export const NAMESPACE = 'mcs:system';
export const REGISTERS = 'registers';
export const STACK = 'stack';

export async function disposeStackFrame(size: number, writer: FunctionWriter) {
  if (size == 0) {
    return;
  }

  await writer.write(
    `data remove storage ${NAMESPACE} ${STACK}[-1]`
  );
}

export async function storeFromR1(to: Location, writer: FunctionWriter) {
  if (to.at === 'none' || to.at === 'r1') {
    return;
  }

  await writer.write(
    `data modify storage ${NAMESPACE} ${resolveLoc(to)} set from storage ${NAMESPACE} ${resolveRegister(1)}`
  );
}

export async function load(env: Env, from: Ref, register: number, writer: FunctionWriter) {
  if (from.kind === 'const') {
    return loadConst(from.value, register, writer);
  } else {
    return loadLocation(env.alloc.resolve(from), register, writer);
  }
}

export async function loadConst(value: Primitive, register: number, writer: FunctionWriter) {
  if (value != null) {
    await writer.write(
      `data modify storage ${NAMESPACE} ${resolveRegister(register)} set value ${serializeValue(value)}`
    );
  }
}

export function serializeValue(value: Primitive) {
  if (typeof value === 'number') {
    return `${value}d`;
  } else {
    return JSON.stringify(value);
  }
}

export async function loadLocation(location: Location, register: number, writer: FunctionWriter) {
  if (
    location.at === 'none'
    || location.at === 'r1' && register === 1
    || location.at === 'r2' && register === 2
  ) {
    return;
  }

  await writer.write(
    `data modify storage ${NAMESPACE} ${resolveRegister(register)} set from storage ${NAMESPACE} ${resolveLoc(location)}`
  );
}

export async function binary(env: Env, op: Binary['op'], left: Ref, right: Ref, writer: FunctionWriter) {
  await load(env, left, 1, writer);
  await load(env, right, 2, writer);
  switch (op) {
    case '+': {
      await writer.write(
        `function mcs_intrinsic:add with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '-': {
      await writer.write(
        `function mcs_intrinsic:sub with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '*': {
      await writer.write(
        `function mcs_intrinsic:mul with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '/': {
      await writer.write(
        `function mcs_intrinsic:div with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '%': {
      await writer.write(
        `function mcs_intrinsic:remi with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '==': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 if predicate mcs_intrinsic:eq`
      );
      break;
    }

    case '!=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:eq`
      );
      break;
    }

    case '>': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:loe`
      );
      break;
    }

    case '<': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:goe`
      );
      break;
    }

    case '>=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 if predicate mcs_intrinsic:goe`
      );
      break;
    }

    case '<=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 if predicate mcs_intrinsic:loe`
      );
      break;
    }

    case '&&': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:zero unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }

    case '||': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:zero`
      );
      await writer.write(
        `execute if predicate mcs_intrinsic:zero store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }
  }
}

export async function unary(env: Env, op: Unary['op'], operand: Ref, writer: FunctionWriter) {
  await load(env, operand, 1, writer);

  switch (op) {
    case '-': {
      await writer.write(
        `function mcs_intrinsic:neg with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '!': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(1)} double 1 if predicate mcs_intrinsic:zero`
      );
      break;
    }
  }
}

export async function call(env: Env, fullName: string, args: Ref[], writer: FunctionWriter) {
  await writer.write(`data modify storage ${NAMESPACE} tmp set value {}`);

  const length = args.length;
  for (let i = 0; i < length; i++) {
    const arg = args[i];
    if (arg.kind === 'const') {
      await writer.write(
        `data modify storage ${NAMESPACE} tmp.a${i} set value ${arg.value}d`
      );
    } else {
      await writer.write(
        `data modify storage ${NAMESPACE} tmp.a${i} set from storage ${NAMESPACE} ${resolveLoc(env.alloc.resolve(arg))}`
      );
    }
  }
  await writer.write(`data modify storage ${NAMESPACE} ${STACK} append from storage ${NAMESPACE} tmp`);
  await writer.write(`function ${fullName}`);
}

export function resolveLoc(loc: Location): string {
  switch (loc.at) {
    case 'none': {
      throw new Error('Trying to get location of non existent locations');
    }

    case 'r1': {
      return resolveRegister(1);
    }

    case 'r2': {
      return resolveRegister(2);
    }

    case 'argument': {
      return `${STACK}[-1].a${loc.index}`;
    }

    case 'local': {
      return `${STACK}[-1].l${loc.index}`;
    }
  }
}

export function resolveRegister(register: number): string {
  return `${REGISTERS}.r${register}`;
}