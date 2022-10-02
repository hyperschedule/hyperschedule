export function mergeArrays(arr: any[][]): any[] {
    return arr.reduce((accumulator, elem) => {
        accumulator.push(...elem);
        return accumulator;
    }, []);
}
