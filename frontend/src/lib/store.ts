export type WithSetters<Shape> = { [K in keyof Shape]: Shape[K] } & {
    [K in keyof Shape as `set${Capitalize<string & K>}`]: (
        value: Shape[K],
    ) => void;
};

export function pick<K extends string>(...keys: readonly K[]) {
    return function <T extends Readonly<Record<K, unknown>>>(
        record: T,
    ): Pick<T, K> {
        const slice: Partial<Pick<T, K>> = {};
        for (const key of keys) slice[key] = record[key];
        return slice as Pick<T, K>;
    };
}
