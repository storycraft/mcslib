export interface FunctionWriter {
    /**
     * function name of the writer
     */
    readonly name: string;

    /**
     * create new branched writer
     */
    createBranch(): FunctionWriter;

    /**
     * write one command
     * @param command command to write
     */
    write(command: string): void;
}
