export type Primitive = string | number | boolean;
export type SortKey = Primitive[];

export function equal(a: SortKey, b: SortKey) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
  return true;
}

export function compare(a: SortKey, b: SortKey) {
  let i = 0;
  while (i < a.length && i < b.length) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
    ++i;
  }
  return i < a.length ? 1 : i < b.length ? -1 : 0;
}
