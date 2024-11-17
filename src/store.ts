export interface Store<T> {
    /**
     * get current value
     * @returns current store value
     * @throws if value is not set
     */
    get(): T;

    /**
     * set value and run a function
     * @param value value to set during callback
     * @param f function to run with value set
     * @returns return value of the function
     */
    with<R>(value: T, f: () => R): R;
}

/**
 * Create global value store
 * @returns new value store implementation
 */
export function create<T>(): Store<T> {
    let current: T | null = null;

    return {
        get(): T {
            if (current == null) {
                throw 'value is not set';
            }

            return current;
        },

        with<R>(value: T, f: () => R): R {
            const prev = current;

            try {
                current = value;
                return f();
            } finally {
                current = prev;
            }
        }
    };
}