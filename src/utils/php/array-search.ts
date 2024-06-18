export function arraySearch<T>(
  value: T,
  array: Record<number, T>
): number | null {
  for (const [arrayKey, arrayValue] of Object.entries(array)) {
    if (arrayValue === value) {
      return Number(arrayKey);
    }
  }

  return null;
}
