import { Diagnostic } from '@/diagnostic.js';
import { Span } from '@/span.js';

export type Token = TokenKind<'string', string> | TokenKind<'number', number>;

type TokenKind<T extends string, V> = {
  kind: T,
  value: V,
}

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

    diagnostics.push({
      level: 'error',
      message: `invalid syntax at: ${i}`,
      span,
    });
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
        { kind: 'number', value: Number.parseInt(hex[0].slice(2), 16) }
      ]
    }

    const bin = /^[-+]?0b?[0-1]+/.exec(sub);
    if (bin) {
      return [
        bin[0].length,
        { kind: 'number', value: Number.parseInt(bin[0].slice(2), 2) }
      ]
    }

    const dec = /^[+-]?\d+(\.\d+)*/.exec(sub);
    if (dec) {
      return [
        dec[0].length,
        { kind: 'number', value: Number.parseFloat(dec[0]) }
      ]
    }

    return null;
  },
  (sub) => {
    for (const keyword of KEYWORDS) {
      if (sub.startsWith(keyword)) {
        return [keyword.length, { kind: 'string', value: keyword }];
      }
    }

    return null;
  }
]
