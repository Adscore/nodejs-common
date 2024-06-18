import { ip2long, long2ip } from "../../../src/utils/php/ip";

describe("IP Utils", () => {
  it("Should convert IP v4 to number and vice versa", () => {
    const ips = ["127.0.0.1", "255.255.255.255", "0.0.0.0"];

    const asNumber = ips.map((x) => ip2long(x));
    const backToAddress = asNumber.map((x) => {
      if (x !== false) {
        return long2ip(x);
      }
    });

    expect(asNumber).toStrictEqual([2130706433, 4294967295, 0]);
    expect(backToAddress).toStrictEqual([
      "127.0.0.1",
      "255.255.255.255",
      "0.0.0.0",
    ]);
  });

  it("should return `false` for IP v6", () => {
    expect(ip2long("::")).toBe(false);
  });
});
