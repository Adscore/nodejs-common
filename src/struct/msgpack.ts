import { AbstractStruct } from "./abstract-struct";
import { encode, decode } from "@msgpack/msgpack";

export const MsgpackType = "M";

/**
 * Msgpack serialization adapter
 */
export class Msgpack extends AbstractStruct {
  public readonly TYPE: string = MsgpackType;

  public pack(data: string): string | Buffer {
    const payload = encode(data);
    return super.pack(Buffer.from(payload));
  }

  public unpack(data: string): string | object {
    const structure = decode(
      Buffer.from(super.unpack(data) as string)
    ) as object;

    return structure;
  }
}
