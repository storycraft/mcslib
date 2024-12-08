import { FunctionDir, Writer } from 'mcslib';
import { Compiler, Export } from 'mcslib/compiler.js';
import { createReadStream } from 'node:fs';
import { opendir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { ZipFile } from 'yazl';
import { DiagnosticPrinter } from './diagnostic.js';
import { VarType } from '@mcslib/builder/var.js';

export class DatapackWriter {
  private readonly compiler: Compiler;
  private readonly zip = new ZipFile();

  constructor(
    namespace: string,
    private readonly out: Writable,
  ) {
    this.compiler = new Compiler(createDir(namespace, this.zip));
    this.zip.outputStream.pipe(out);
  }

  async includeDir(dir: string, to?: string) {
    for await (const path of walkDir(dir)) {
      const relPath = relative(dir, path);
      let archivePath: string;
      if (to != null) {
        archivePath = `${to}/${relPath}`;
      } else {
        archivePath = relPath;
      }

      await this.addStream(archivePath, createReadStream(path));
    }
  }

  addBuffer(name: string, buffer: Buffer) {
    this.zip.addBuffer(buffer, name);
  }

  async addStream(name: string, stream: Readable) {
    this.zip.addReadStream(stream, name);
    await new Promise(resolve => stream.once('close', resolve));
  }

  async export<const Args extends VarType[]>(settings: Export<Args>): Promise<boolean> {
    const {
      diagnostics,
    } = await this.compiler.export(settings);

    if (diagnostics.length > 0) {
      const printer = new DiagnosticPrinter();
      printer.push(...diagnostics);
      printer.print();

      if (diagnostics.some(({ level }) => level === 'error')) {
        return false;
      }
    }

    return true;
  }

  async finish() {
    this.zip.end();
    await new Promise(resolve => this.out.once('close', resolve));
  }
}

function createDir(namespace: string, zip: ZipFile): FunctionDir {
  return {
    namespace,
    create(name: string): Promise<Writer> {
      const path = `data/${this.namespace}/function/${name}.mcfunction`;

      let content = '';
      return Promise.resolve({
        write(command) {
          content += command + '\n';
          return Promise.resolve();
        },

        close() {
          zip.addBuffer(Buffer.from(content), path);
          return Promise.resolve();
        },
      });
    }
  };
}

async function* walkDir(start: string): AsyncGenerator<string> {
  const dirs: string[] = [];
  for (
    let path: string | undefined = start;
    path != null;
    path = dirs.pop()
  ) {
    for await (const d of await opendir(path)) {
      const entry = join(path, d.name);
      if (d.isDirectory()) {
        dirs.push(entry);
      } else if (d.isFile()) {
        yield entry;
      }
    }
  }
}
