export interface FunctionDir {
  /**
   * get namespace of the datapack dir
   */
  get namespace(): string;

  /**
   * create a new writer
   * @param name name of the function
   */
  create(name: string): Promise<Writer>;
}

export interface Writer {
  write(command: string): Promise<void>;
}

export class FunctionWriter {
  /**
   * create a new FunctionWriter from dir
   * @param dir FunctionDir to create writer
   * @param name name of the function
   */
  public static async create(dir: FunctionDir, name: string): Promise<FunctionWriter> {
    return new FunctionWriter(
      {
        dir,
        fnName: name,
        nextBranchId: 1,
      },
      name,
      await dir.create(name),
    );
  }

  private constructor(
    private readonly cx: Context,
    public readonly name: string,
    private readonly writer: Writer,
  ) {

  }

  get namespace() {
    return this.cx.dir.namespace;
  }

  /**
   * create a new branch
   * @returns a writer to branch
   */
  async createBranch(): Promise<FunctionWriter> {
    const nextBranchId = this.cx.nextBranchId++;
    const name = `__${this.cx.fnName}_b${nextBranchId}`;

    return new FunctionWriter(
      this.cx,
      name,
      await this.cx.dir.create(name),
    );
  }

  /**
   * write one command
   * @param command command to write
   */
  async write(command: string) {
    return this.writer.write(command);
  }
}

type Context = {
  dir: FunctionDir,
  nextBranchId: number,
  fnName: string,
}
