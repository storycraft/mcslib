import { FunctionWriter } from '@/mcslib.js';
import { Location } from './alloc.js';
import { Env } from '@/codegen.js';
import { Ref } from '@/ir.js';

const NAMESPACE = 'mcs:system';
const STACK = 'stack';
const REGISTERS = 'registers';

export async function storeFromR1(to: Location, writer: FunctionWriter) {
  if (to.at === 'none' || to.at === 'r1') {
    return;
  }

  switch (to.at) {
    case 'argument': {
      await writer.write(
        `data modify storage ${NAMESPACE} stack[-2][-${to.index + 1}] set from storage ${NAMESPACE} ${resolveRegister(1)}`
      );
      break;
    }

    case 'frame': {
      await writer.write(
        `data modify storage ${NAMESPACE} stack[-1][${to.index}] set from storage ${NAMESPACE} ${resolveRegister(1)}`
      );
      break;
    }
  }
}

export async function load(env: Env, from: Ref, register: number, writer: FunctionWriter) {
  if (from.expr === 'const') {
    if (from.ty === 'empty') {
      return;
    }

    await writer.write(
      `data modify storage ${NAMESPACE} ${resolveRegister(register)} set value ${from.value}d`
    );
  } else {
    const loc = env.storages[from.index];
    if (loc.at === 'r1' && register === 1) {
      return;
    }

    await writer.write(
      `data modify storage ${NAMESPACE} ${resolveRegister(register)} set from storage ${NAMESPACE} ${resolveLoc(loc)}`
    );
  }
  
}

export async function add(env: Env, left: Ref, right: Ref, writer: FunctionWriter) {
  return arithmetic(env, 'add', left, right, writer);
}

export async function sub(env: Env, left: Ref, right: Ref, writer: FunctionWriter) {
  return arithmetic(env, 'sub', left, right, writer);
}

export async function mul(env: Env, left: Ref, right: Ref, writer: FunctionWriter) {
  return arithmetic(env, 'mul', left, right, writer);
}

export async function div(env: Env, left: Ref, right: Ref, writer: FunctionWriter) {
  return arithmetic(env, 'div', left, right, writer);
}

export async function remi(env: Env, left: Ref, right: Ref, writer: FunctionWriter) {
  return arithmetic(env, 'remi', left, right, writer);
}

async function arithmetic(env: Env, op: string, left: Ref, right: Ref, writer: FunctionWriter) {
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

function resolveLoc(loc: Location): string {
  switch (loc.at) {
    case 'none': {
      throw new Error('Trying to get location of non existent locations');
    }

    case 'r1': {
      return resolveRegister(1);
    }

    case 'argument': {
      return `${STACK}[-2][-${loc.index + 1}]`;
    }

    case 'frame': {
      return `${STACK}[-1][${loc.index}]`;
    }
  }
}

function resolveRegister(register: number): string {
  return `${REGISTERS}.r${register}`;
}