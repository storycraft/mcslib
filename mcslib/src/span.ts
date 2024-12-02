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

/**
 * Create a new span of the call site
 */
export function callSite(): Span {
  const pos = new StackTracey().items[1];
  return {
    location: pos.fileRelative,
    line: pos.line,
    col: pos.column,
  };
}

/**
 * Create a new span of unknown location
 */
export function unknownSpan(): Span {
  return {
    location: '<unknown>',
  };
}
