import { FunctionWriter } from '@/mcslib.js';
import { Location } from './alloc.js';
import { Env } from '@/codegen.js';
import { Arith, Ref } from '@/ir.js';
import { IR_DEFAULT_CONST } from '@/ir/types.js';

const NAMESPACE = 'mcs:system';
const LOCAL = 'locals';
const ARGUMENTS = 'arguments';
const REGISTERS = 'registers';

export async function initStackFrame(size: number, writer: FunctionWriter) {
  if (size == 0) {
    return;
  }

  const list = new Array<string>(size);
  list.fill(`${IR_DEFAULT_CONST.number.value}d`);

  await writer.write(
    `data modify storage ${NAMESPACE} ${LOCAL} append value [${list.join(',')}]`
  );
}

export async function disposeStackFrame(size: number, writer: FunctionWriter) {
  if (size == 0) {
    return;
  }

  await writer.write(
    `data remove storage ${NAMESPACE} ${LOCAL}[-1]`
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
  if (from.expr === 'const') {
    if (from.ty === 'empty') {
      return;
    }

    return loadConstNumber(from.value, register, writer);
  } else {
    return loadIndex(env, from.index, register, writer);
  }
}

export async function loadConstNumber(value: number, register: number, writer: FunctionWriter) {
  await writer.write(
    `data modify storage ${NAMESPACE} ${resolveRegister(register)} set value ${value}d`
  );
}

export async function loadIndex(env: Env, index: number, register: number, writer: FunctionWriter) {
  const loc = env.storages[index];
  if (loc.at === 'none' || loc.at === 'r1' && register === 1) {
    return;
  }

  await writer.write(
    `data modify storage ${NAMESPACE} ${resolveRegister(register)} set from storage ${NAMESPACE} ${resolveLoc(loc)}`
  );
}

export async function arithmetic(env: Env, op: Arith['expr'], left: Ref, right: Ref, writer: FunctionWriter) {
  if (left.expr === 'const' && right.expr === 'const') {
    if (left.ty === 'empty' || right.ty === 'empty') {
      throw new Error(`Tried to run ${op} ins with non existent locations left: ${left.ty} right: ${right.ty}`);
    }

    await writer.write(
      `data modify storage ${NAMESPACE} ${resolveRegister(1)} set value ${left.value + right.value}`
    );
    return;
  }

  await load(env, left, 1, writer);
  await load(env, right, 2, writer);
  await writer.write(
    `function mcs_intrinsic:${op} with storage ${NAMESPACE} ${REGISTERS}`
  );
}

export async function neg(env: Env, operand: Ref, writer: FunctionWriter) {
  if (operand.expr === 'const') {
    if (operand.ty === 'empty') {
      throw new Error(`Tried to run neg ins with a non existent location`);
    }

    await writer.write(
      `data modify storage ${NAMESPACE} ${resolveRegister(1)} set value ${-operand.value}d`
    );
    return;
  }

  await load(env, operand, 1, writer);
  await writer.write(
    `function mcs_intrinsic:neg with storage ${NAMESPACE} ${REGISTERS}`
  );
}

export async function call(env: Env, name: string, args: Ref[], writer: FunctionWriter) {
  const length = args.length;
  for (let i = 0; i < length; i++) {
    const arg = args[i];

    if (arg.expr === 'const') {
      if (arg.ty === 'empty') {
        throw new Error('Cannot use empty type as a argument');
      }

      await writer.write(
        `data modify storage ${NAMESPACE} ${ARGUMENTS}[-1] append value ${arg.value}d`
      );
    } else {
      await writer.write(
        `data modify storage ${NAMESPACE} ${ARGUMENTS}[-1] append from storage ${NAMESPACE} ${resolveLoc(env.storages[arg.index])}`
      );
    }
  }

  await writer.write(`function ${name}`);
  await writer.write(`data remove storage ${NAMESPACE} ${ARGUMENTS}[-1]`);
}

function resolveLoc(loc: Location): string {
  switch (loc.at) {
    case 'none': {
      throw new Error('Trying to get location of non existent locations');
    }

    case 'r1': {
      return resolveRegister(1);
    }

    case 'argument': {
      return `${ARGUMENTS}[-1][${loc.index}]`;
    }

    case 'frame': {
      return `${LOCAL}[-1][${loc.index}]`;
    }
  }
}

function resolveRegister(register: number): string {
  return `${REGISTERS}.r${register}`;
}