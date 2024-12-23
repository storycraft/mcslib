import { Span, diagnostic, Diagnostic } from '@mcslib/core';

export type Token = {
  kind: 'keyword' | 'number',
  value: string,
};

type Result = {
  tokens: Token[],
  diagnostics: Diagnostic[],
}

export function lex(str: string, span: Span): Result {
  if (str === '') {
    return {
      tokens: [],
      diagnostics: [],
    };
  }

  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];

  const length = str.length;
  outer: for (let i = 0; i < length;) {
    while (str[i] === ' ') {
      i++;
    }
    if (i >= length) {
      break;
    }

    for (const rule of RULESET) {
      const res = rule(str.slice(i));
      if (!res) {
        continue;
      }

      const [read, token] = res;
      tokens.push(token);
      i += read;
      continue outer;
    }

    diagnostics.push(
      diagnostic(
        'error',
        `invalid syntax at: ${i}`,
        span,
      )
    );
    i++;
  }

  return {
    tokens,
    diagnostics,
  };
}

type LexFn = (sub: string) => [number, Token] | null;

const KEYWORDS: string[] = [
  '+',
  '-',
  '*',
  '/',
  '%',
  '(',
  ')',
  '>=',
  '<=',
  '>',
  '<',
  '==',
  '!=',
  '!',
  '||',
  '&&',
];

const RULESET: LexFn[] = [
  (sub) => {
    const hex = /^[-+]?0x[0-9A-Fa-f]+/.exec(sub);
    if (hex) {
      return [
        hex[0].length,
        { kind: 'number', value: Number.parseInt(hex[0].slice(2), 16).toString() }
      ]
    }

    const bin = /^[-+]?0b?[0-1]+/.exec(sub);
    if (bin) {
      return [
        bin[0].length,
        { kind: 'number', value: Number.parseInt(bin[0].slice(2), 2).toString() }
      ]
    }

    const dec = /^[+-]?\d+(\.\d+)*/.exec(sub);
    if (dec) {
      return [
        dec[0].length,
        { kind: 'number', value: dec[0] }
      ]
    }

    return null;
  },
  (sub) => {
    for (const value of KEYWORDS) {
      if (sub.startsWith(value)) {
        return [value.length, { kind: 'keyword', value }];
      }
    }

    return null;
  }
]
