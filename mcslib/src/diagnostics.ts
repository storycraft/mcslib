import { Span } from './span.js';

export type Level = 'warn' | 'error';

export type Diagnostics = {
  level: Level,
  message: string,
  span: Span,
}

export function diagnostics(level: Level, message: string, span: Span): Diagnostics {
  return {
    level,
    message,
    span,
  };
}
