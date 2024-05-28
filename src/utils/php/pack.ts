/**
 * Partial Implementation of PHP's `pack`, see https://www.php.net/manual/en/function.pack
 */
export function pack(
  format: string,
  ...inputs: Array<number | bigint>
): Buffer {
  const instructions = format?.split("");

  if (instructions.length !== inputs.length) {
    throw new Error(
      `Invalid format length, expected ${inputs.length} number of codes`
    );
  }

  const result: Buffer[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const { code, name } = getCodeAndName(instructions[i]);
    const encodedData = encode(inputs[i], code);
    result.push(encodedData);
  }

  return Buffer.concat(result);
}

function encode(input: number | bigint, code: string): Buffer {
  switch (code) {
    // signed char
    case "c":
    // unsigned char
    case "C":
      throwIfBigInt(input, "char");
      const c = Buffer.alloc(1);
      c.writeInt8(input);
      return c;

    // unsigned short (always 16 bit, big endian byte order)
    case "n":
      throwIfBigInt(input, "short");
      const n = Buffer.alloc(2);
      n.writeInt16BE(input);
      return n;

    // unsigned long long (always 64 bit, big endian byte order)
    case "J":
      const j = Buffer.alloc(8);
      j.writeBigUint64BE(BigInt(input));
      return j;

    // 	unsigned short (always 16 bit, little endian byte order)
    case "v":
      throwIfBigInt(input, "short");
      const v = Buffer.alloc(2);
      v.writeInt16LE(input);
      return v;
  }

  throw new Error(`Unrecognized instruction: ${code}`);
}

function throwIfBigInt(
  input: number | bigint,
  type: string
): asserts input is number {
  if (typeof input === "bigint") {
    throw new Error("Cannot write bigint into " + type);
  }
}

function getCodeAndName(instruction: string): {
  name: string;
  code: string;
} {
  if (!instruction?.length) {
    throw new Error("Empty instruction");
  }

  return {
    code: instruction.charAt(0),
    name: instruction.substring(1),
  };
}
