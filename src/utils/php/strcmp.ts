export function strcmp(
  input1: string | null,
  input2: string | null
): number | null {
  if (input2 === null) {
    return null;
  }

  return input1?.localeCompare(input2) ?? null;
}
