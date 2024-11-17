export type Command = {
    text: string,
};

/**
 * create raw command
 * @param text command
 * @returns Command object
 */
export function rawConst(text: string): Command {
    return { text };
}
