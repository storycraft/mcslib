import { FunctionWriter } from '@/lib.js';
import { Env, NAMESPACE, REGISTERS, resolveLoc, resolveRegister, STACK } from '@/emit.js';
import { Binary, Ref, Unary } from '@/ir.js';

export async function binary(op: Binary['op'], writer: FunctionWriter) {
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
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:eq`
      );
      break;
    }

    case '!=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:eq`
      );
      break;
    }

    case '>': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:loe`
      );
      break;
    }

    case '<': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:goe`
      );
      break;
    }

    case '>=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:goe`
      );
      break;
    }

    case '<=': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:loe`
      );
      break;
    }

    case '&&': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }

    case '||': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero`
      );
      await writer.write(
        `execute if predicate mcs_intrinsic:zero store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 unless predicate mcs_intrinsic:zero_r2`
      );
      break;
    }
  }
}

export async function unary(op: Unary['op'], writer: FunctionWriter) {
  switch (op) {
    case '-': {
      await writer.write(
        `function mcs_intrinsic:neg with storage ${NAMESPACE} ${REGISTERS}`
      );
      break;
    }

    case '!': {
      await writer.write(
        `execute store success storage ${NAMESPACE} ${resolveRegister(0)} double 1 if predicate mcs_intrinsic:zero`
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
