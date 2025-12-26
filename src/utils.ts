export function sortObjectKeys<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)),
  ) as T
}
