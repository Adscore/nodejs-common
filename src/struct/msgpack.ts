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

  public unpack(data: Buffer): string | object {
    const structure = decode(super.unpack(data) as Buffer) as object;

    return structure;
  }
}
