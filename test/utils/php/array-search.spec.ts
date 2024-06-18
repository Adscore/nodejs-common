import { arraySearch } from "../../../src/utils/php";

describe("arraySearch", () => {
  it("Should return key for matching value", () => {
    const obj = { 1: "value1", 2: "value2" };

    expect(arraySearch("value1", obj)).toBe(1);
    expect(arraySearch("value2", obj)).toBe(2);
    expect(arraySearch("value3", obj)).toBe(null);
  });
});
