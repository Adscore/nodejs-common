export function arraySum(input: Record<string, number> | number[]): number {
  const data = Object.values(input);

  return data.reduce((prev, curr) => (curr += prev));
}
