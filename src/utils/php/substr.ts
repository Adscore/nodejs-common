export function substr(input: string, offset: number, length?: number): string {
  if (length !== undefined) {
    // substring accept `end` where in PHP it accept `length`
    return input.substring(offset, offset + length);
  }

  return input.substring(offset, length);
}

export function substrBuffer(
  input: Buffer,
  offset: number,
  length?: number
): Buffer {
  if (length !== undefined) {
    // subarray accept `end` where in PHP it accept `length`
    const end = offset + length;
    return input.subarray(offset, end);
  }

  return input.subarray(offset, length);
}
