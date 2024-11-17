export interface FunctionDir {
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
      dir,
      name,
      name,
      0,
      await dir.create(name),
    );
  }

  private constructor(
    private readonly dir: FunctionDir,
    public readonly name: string,
    private readonly fnName: string,
    private readonly branchId: number,
    private readonly writer: Writer,
  ) {
    
  }

  /**
   * create a new branch
   * @returns a writer to branch
   */
  async createBranch(): Promise<FunctionWriter> {
    const name = `__${this.fnName}b${this.branchId + 1}`;

    return new FunctionWriter(
      this.dir,
      name,
      this.fnName,
      this.branchId,
      await this.dir.create(name),
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
