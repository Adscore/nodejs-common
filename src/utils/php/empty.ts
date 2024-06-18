export function empty(
  input: string | Array<any> | number | null | undefined | boolean
): boolean {
  if (Array.isArray(input)) {
    return input.length === 0;
  }

  if (input === "0") return true;

  return !input;
}
