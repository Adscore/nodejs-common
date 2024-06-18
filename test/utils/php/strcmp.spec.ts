import { strcmp } from "../../../src/utils/php";

describe("strcmp", () => {
  it("should compare strings", () => {
    // based on https://www.php.net/manual/en/function.strcmp.php#108563, but in this library we are
    // only checking if result is different than 0, so implementation is not 100% correct with PHP
    expect(strcmp("5", 5)).toBe(0);
    expect(strcmp("15", 0xf)).toBe(0);
    expect(strcmp(null, false)).toBe(0);
    expect(strcmp(null, "")).toBe(0);
    expect(strcmp(null, 0)).toBe(-1);
    expect(strcmp(false, -1)).toBe(-1);
    expect(strcmp("15", null)).toBe(1);
    expect(strcmp(null, "foo")).toBe(-1);
    expect(strcmp("foo", null)).toBe(1);
    expect(strcmp("foo", false)).toBe(1);
    expect(strcmp("foo", 0)).toBe(1);
    expect(strcmp("foo", 5)).toBe(1);
  });
});
