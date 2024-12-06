import { Env, NAMESPACE, REGISTERS, resolveLoc, resolveRegister, STACK, TrackedWriter } from '@/emit.js';
import { BinaryOp, Ref, UnaryOp } from '@/ir.js';
import { Location } from './alloc.js';

export async function binary(op: BinaryOp, writer: TrackedWriter) {
  switch (op) {
    case 'add': {
      await writer.inner.write(
        `function mcs_intrinsic:add with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'concat': {
      await writer.inner.write(
        `function mcs_intrinsic:concat with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'sub': {
      await writer.inner.write(
        `function mcs_intrinsic:sub with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'mul': {
      await writer.inner.write(
        `function mcs_intrinsic:mul with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'div': {
      await writer.inner.write(
        `function mcs_intrinsic:div with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'rem': {
      await writer.inner.write(
        `function mcs_intrinsic:remi with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'eq': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:eq`
      );
      break;
    }

    case 'ne': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:eq`
      );
      break;
    }

    case 'gt': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:loe`
      );
      break;
    }

    case 'lt': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:goe`
      );
      break;
    }

    case 'goe': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:goe`
      );
      break;
    }

    case 'loe': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:loe`
      );
      break;
    }

    case 'and': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }

    case 'or': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero`
      );
      await writer.inner.write(
        `execute if predicate mcs_intrinsic:zero store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }
  }

  writer.invalidate(Location.register(0));
}

export async function unary(op: UnaryOp, writer: TrackedWriter) {
  switch (op) {
    case 'neg': {
      await writer.inner.write(
        `function mcs_intrinsic:neg with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case 'not': {
      await writer.inner.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:zero`
      );
      break;
    }
  }

  writer.invalidate(Location.register(0));
}

export async function call(env: Env, fullName: string, args: Ref[], writer: TrackedWriter) {
  await writer.inner.write(`data modify storage ${NAMESPACE} tmp set value {}`);

  const length = args.length;
  for (let i = 0; i < length; i++) {
    const arg = args[i];
    if (arg.kind === 'const') {
      await writer.inner.write(
        `data modify storage ${NAMESPACE} tmp.a${i} set value ${arg.value}d`
      );
    } else {
      await writer.inner.write(
        `data modify storage ${NAMESPACE} tmp.a${i} set from storage ${NAMESPACE} ${resolveLoc(env.alloc.resolve(arg))}`
      );
    }
  }
  await writer.inner.write(`data modify storage ${NAMESPACE} ${STACK} append from storage ${NAMESPACE} tmp`);
  await writer.inner.write(`function ${fullName}`);
  writer.invalidateAll();
}
