import { empty } from "../../../src/utils/php/empty";

describe("empty", () => {
  it("should identify empty value", () => {
    expect(empty(null)).toBe(true);
    expect(empty(undefined)).toBe(true);
    expect(empty([])).toBe(true);
    expect(empty("")).toBe(true);
    expect(empty(0)).toBe(true);
    expect(empty("0")).toBe(true);

    expect(empty([""])).toBe(false);
    expect(empty("test")).toBe(false);
  });
});
