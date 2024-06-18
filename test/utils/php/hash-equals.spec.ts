import { hashEquals } from "../../../src/utils/php/hash-equals";

describe("hashEquals", () => {
  it("should compare buffers", () => {
    expect(hashEquals(Buffer.from("test"), Buffer.from("test"))).toBe(true);
    expect(hashEquals(Buffer.from("test"), Buffer.from("t3st"))).toBe(false);
    expect(hashEquals(Buffer.from("Test"), Buffer.from("test"))).toBe(false);
  });
});
