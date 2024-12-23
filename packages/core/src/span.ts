import StackTracey from 'stacktracey';

/**
 * Represent the approximate location of the source
 */
export type Span = {
  /**
   * Location of the span
   */
  location: string,
  /**
   * Line number in the file
   */
  line?: number,

  /**
   * Column number in the file
   */
  col?: number,
}

export const Span = {
  /**
   * Create a new span of the best effort call site
   */
  callSite(offset = 0): Span {
    const pos = new StackTracey(undefined, 2 + offset).items[0];
    return {
      location: pos.fileRelative,
      line: pos.line,
      col: pos.column,
    };
  },

  /**
   * Create a new span of unknown location
   */
  unknown(): Span {
    return {
      location: '<unknown>',
    };
  }
} as const;
