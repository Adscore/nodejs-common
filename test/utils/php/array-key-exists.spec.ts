import { arrayKeyExists } from "../../../src/utils/php/array-key-exists";

describe("arrayKeyExists", () => {
  it("identifies whether a given key exists in object", () => {
    const obj = { test: true, test2: true, 1: true, "2": true };

    expect(arrayKeyExists("test", obj)).toBe(true);
    expect(arrayKeyExists(1, obj)).toBe(true);
    expect(arrayKeyExists("1", obj)).toBe(true);
    expect(arrayKeyExists(2, obj)).toBe(true);
    expect(arrayKeyExists("2", obj)).toBe(true);
    expect(arrayKeyExists("test3", obj)).toBe(false);
  });
});
