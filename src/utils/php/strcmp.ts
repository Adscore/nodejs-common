export function strcmp(
  input1: string | number | boolean | null,
  input2: string | number | boolean | null
): number | null {
  if (input1 === null || input1 === false) {
    input1 = "";
  }

  if (input2 === null || input2 === false) {
    input2 = "";
  }

  return input1?.toString()?.localeCompare(input2?.toString()) ?? null;
}
