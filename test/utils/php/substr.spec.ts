import { substr, substrBuffer } from "../../../src/utils/php";

describe("substr", () => {
  it("substrBuffer should slice Buffer", () => {
    expect(substrBuffer(Buffer.from("test"), 2)).toStrictEqual(
      Buffer.from("st")
    );
    expect(substrBuffer(Buffer.from("test"), 2, 1)).toStrictEqual(
      Buffer.from("s")
    );
  });

  it("substr should slice string", () => {
    expect(substr("test", 2)).toEqual("st");
    expect(substr("test", 2, 1)).toEqual("s");
  });
});
