import { arraySum } from "../../../src/utils/php";

describe("arraySum", () => {
  it("should sum up values of a record", () => {
    expect(arraySum({ key1: 1, key2: 2, key3: 3 })).toBe(6);
  });

  it("should sum up array of numbers", () => {
    expect(arraySum([1, 2, 3])).toBe(6);
  });
});
