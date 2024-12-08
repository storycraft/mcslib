import { IrFunction, Ref } from '@/ir.js';
import { FunctionWriter } from './lib.js';
import { Alloc, alloc, Location } from './emit/alloc.js';
import { NodeMap, walkNode } from './emit/node.js';
import { McsFunction } from '@mcslib/builder/fn.js';
import { AstType, wrapTyped } from '@mcslib/builder/ast/type.js';

export const NAMESPACE = 'mcs:system';
export const REGISTERS = 'registers';
export const STACK = 'stack';

/**
 * emit functions from ir
 * @param ir 
 * @param linkMap
 * @param writer 
 */
export async function emit(
  ir: IrFunction,
  linkMap: Map<McsFunction, string>,
  writer: FunctionWriter
) {
  const env: Env = {
    alloc: alloc(ir),
    nodeMap: new NodeMap(ir.node, writer.name),
    linkMap,
  };

  await walkNode(env, ir.node, new TrackedWriter(writer));
}

export type Env = {
  alloc: Alloc,
  nodeMap: NodeMap,
  linkMap: Map<McsFunction, string>,
}

export type RegState = Location[];

export function initialState(): RegState {
  return [];
}

/**
 * Track register states of each nodes and corresponding {@link FunctionWriter}
 */
export class TrackedWriter {
  constructor(
    public readonly inner: FunctionWriter,
    private state: RegState = initialState(),
  ) { }

  async copyRef(alloc: Alloc, from: Ref, to: Location) {
    if (from.kind === 'const') {
      return this.copyConst(from.type, from.value, to);
    } else {
      return this.copy(alloc.resolve(from), to);
    }
  }

  async copy(from: Location, to: Location) {
    if (this.same(from, to)) {
      return;
    }

    if (to.at === 'register') {
      const loc = this.state.at(to.index);
      if (loc && this.same(from, loc)) {
        return;
      }
      this.state[to.index] = from;
    }

    await this.inner.write(
      `data modify storage ${NAMESPACE} ${resolveLoc(to)} set from storage ${NAMESPACE} ${resolveLoc(from)}`
    );
  }

  async copyConst(type: AstType, value: string, to: Location) {
    if (type !== 'empty') {
      this.invalidate(to);

      await this.inner.write(
        `data modify storage ${NAMESPACE} ${resolveLoc(to)} set value ${wrapTyped(type, value)}`
      );
    }
  }

  invalidateAll() {
    this.state = initialState();
  }

  invalidate(loc: Location) {
    if (loc.at === 'register' && !(this.state.at(loc.index)?.at === 'none')) {
      this.state[loc.index] = Location.none();
    }
  }

  async close() {
    return this.inner.close();
  }

  /**
   * Check if two locations are pointing same.
   * 
   * @returns true if same, false otherwise
   */
  private same(loc1: Location, loc2: Location): boolean {
    if (loc1.at === 'none' && loc2.at === 'none') {
      return true;
    }

    if (loc1.at !== 'none' && loc1.at === loc2.at) {
      return loc1.index === loc2.index;
    }

    return false;
  }

  async branch(): Promise<TrackedWriter> {
    return new TrackedWriter(
      await this.inner.createBranch(),
    )
  }
}

export function resolveLoc(loc: Location): string {
  switch (loc.at) {
    case 'none': {
      throw new Error('Trying to get location of non existent locations');
    }

    case 'register': {
      return resolveRegister(loc.index);
    }

    case 'argument':
    case 'local': {
      return `${STACK}[-1].${resolveStack(loc)}`;
    }
  }
}

export function resolveStack(loc: Location): string {
  switch (loc.at) {
    case 'argument': {
      return `a${loc.index}`;
    }

    case 'local': {
      return `l${loc.index}`;
    }

    default: {
      throw new Error(`Not a stack location at: ${loc.at}`);
    }
  }
}

export function resolveRegister(register: number): string {
  return `${REGISTERS}.r${register + 1}`;
}
