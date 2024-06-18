// from https://github.com/wangwenming/ip2long/blob/master/index.js

let multipliers = [0x1000000, 0x10000, 0x100, 1];

export function ip2long(ip: string): number | false {
  if (ip.includes(":")) {
    // IPv6
    return false;
  }

  let longValue = 0;
  ip.split(".").forEach((part: string, i) => {
    longValue += Number(part) * multipliers[i];
  });

  return longValue;
}

export function long2ip(longValue: number): string {
  return multipliers
    .map((multiplier) => {
      return Math.floor((longValue % (multiplier * 0x100)) / multiplier);
    })
    .join(".");
}

exports.ip2long = ip2long;
exports.long2ip = long2ip;
