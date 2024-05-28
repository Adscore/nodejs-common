export function base64Encode(input: string): string {
  return Buffer.from(input).toString("base64");
}

export function base64Decode(base64Input: string): Buffer {
  return Buffer.from(base64Input, "base64");
}
