import { chunkSplit } from "../../../src/utils/php";

describe("chunkSplit", () => {
  it("should add newLine separator into string to make it multiline", () => {
    expect(chunkSplit("testtesttesttest", 4)).toBe(
      "test\r\ntest\r\ntest\r\ntest\r\n"
    );
  });
});
