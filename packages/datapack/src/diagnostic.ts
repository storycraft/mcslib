import { Chalk } from 'chalk';
import { Diagnostic } from 'mcslib/diagnostic.js';

export class DiagnosticPrinter {
  private readonly chalk = new Chalk();
  private readonly map = new Map<string, Diagnostic[]>();

  push(...diagnostics: Diagnostic[]) {
    for (const diagnostic of diagnostics) {
      let arr = this.map.get(diagnostic.span.location);
      if (!arr) {
        arr = [];
        this.map.set(diagnostic.span.location, arr);
      }

      arr.push(diagnostic);
    }
  }

  print() {
    for (const [location, diagnostics] of this.map) {
      console.group(this.chalk.underline(location));
      for (const diagnostic of diagnostics) {
        let levelStr = 'log';
        switch (diagnostic.level) {
          case 'error': {
            levelStr = this.chalk.red('error');
            break;
          }

          case 'warn': {
            levelStr = this.chalk.yellow('warn');
            break;
          }
        }

        const span = diagnostic.span;
        const spanStr = this.chalk.gray(`${span.line ?? 'unknown'}:${span.col ?? 'unknown'}`);

        console.log(`${spanStr} ${levelStr} ${diagnostic.message}`);
      }
      console.groupEnd();
    }
  }
}