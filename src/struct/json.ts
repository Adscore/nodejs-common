import { AbstractStruct } from "./abstract-struct";

export const JsonType = "J";

/**
 * JSON serialization adapter
 */
export class Json extends AbstractStruct {
  public readonly TYPE: string = JsonType;

  /**
   * Returns the JSON representation of a value
   * @param mixed $data
   * @return string
   */
  public pack(data: Buffer): string {
    throw new Error("Not supported");
  }

  /**
   * Takes a JSON encoded string and converts it into a PHP value
   * @param string $data
   * @return mixed
   */
  public unpack(data: Buffer): string | object {
    const structure = JSON.parse(super.unpack(data).toString());
    return structure;
  }
}
