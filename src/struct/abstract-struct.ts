import { strlen } from "../utils/php/strlen";
import { strpos } from "../utils/php/strpos";
import { substr, substrBuffer } from "../utils/php/substr";

/**
 * Common base for serialization/deserialization methods
 *
 */
export abstract class AbstractStruct {
  abstract TYPE: string;

  /**
   * Packs structure into serialized format
   * @param mixed $data
   * @return string
   */
  public pack(data: string | Buffer): string | Buffer {
    throw new Error('Not supported');
  }

  /**
   * Unpacks structure from serialized format
   * @param string $data
   * @return mixed
   */
  public unpack(data: Buffer): string | object {
    if (strpos(data.toString(), this.TYPE) !== 0) {
      throw new Error("Unexpected serializer type");
    }

    return substrBuffer(data, strlen(this.TYPE));
  }
}
