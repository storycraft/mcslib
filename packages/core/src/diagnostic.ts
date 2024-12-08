import { Span } from './span.js';

export type Level = 'info' | 'warn' | 'error';

export type Diagnostic = {
  level: Level,
  message: string,
  span: Span,
}

export function diagnostic(level: Level, message: string, span: Span): Diagnostic {
  return {
    level,
    message,
    span,
  };
}
