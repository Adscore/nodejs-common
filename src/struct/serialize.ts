import { serialize, unserialize } from "php-serialize";
import { AbstractStruct } from "./abstract-struct";

export const SerializeType = "S";

/**
 * Native serialization adapter
 *
 */
export class Serialize extends AbstractStruct {
  public readonly TYPE: string = SerializeType;

  /**
   * Generates a storable representation of a value
   * @param mixed $data
   * @return string
   */
  public pack(data: string | Buffer): string | Buffer {
    const payload = serialize(data);
    return super.pack(payload);
  }

  /**
   * Creates a value from a stored representation
   */
  public unpack(data: Buffer): string {
    const structure = unserialize(super.unpack(data).toString(), {
      allowed_classes: false,
    });

    return structure;
  }
}
