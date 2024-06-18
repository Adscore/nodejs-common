export function sprintf(format: string, ...params: any[]) {
  const parts = format.matchAll(/(%[a-z0-9]+)/g);

  let paramIndex = 0;
  let result = "";

  for (const key of parts) {
    const param: string | number = params[paramIndex];

    if (key[0] === "%02x") {
      result += param.toString(16).padStart(2, "0");
    } else {
      result += param.toString();
    }

    paramIndex++;
  }

  return result;
}
