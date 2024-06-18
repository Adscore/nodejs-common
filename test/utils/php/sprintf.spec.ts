import { sprintf } from "../../../src/utils/php/sprintf";

describe("sprintf", () => {
  it("should format number as hex", () => {
    expect(sprintf("%s%02x", "ulong", 0)).toBe("ulong00");
    expect(sprintf("%s%02x", "ulong", 10)).toBe("ulong0a");
    expect(sprintf("%s%02x", "ulong", 255)).toBe("ulongff");
  });
});
