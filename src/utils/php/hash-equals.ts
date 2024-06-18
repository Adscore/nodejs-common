import crypto from "node:crypto";

export function hashEquals(input: Buffer, compare: Buffer) {
  const rb = crypto.pseudoRandomBytes(32);
  const a = crypto.createHmac("sha256", rb).update(input).digest("hex");
  const b = crypto.createHmac("sha256", rb).update(compare).digest("hex");

  return a === b;
}
