export function arrayKeyExists(
  key: any,
  associativeArray: Record<any, any>
): boolean {
  return Object.keys(associativeArray).includes(key?.toString());
}
