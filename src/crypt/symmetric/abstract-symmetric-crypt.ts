import { substrBuffer } from "../../utils/php";
import { arraySum } from "../../utils/php/array-sum";
import { unpack } from "../../utils/php/unpack";
import { CryptParseError } from "../errors";

export abstract class AbstractSymmetricCrypt {
  public static readonly METHOD_SIZE = 2;

  public abstract encryptWithKey(data: string, key: Buffer): string;
  public abstract decryptWithKey(data: Buffer, key: Buffer): Buffer;
  public abstract key(password: string, salt?: string): Buffer;

  public encrypt(data: string, password: string, salt?: string): string {
    const key = this.key(password, salt);
    return this.encryptWithKey(data, key);
  }

  public decrypt(data: Buffer, password: string, salt: string): Buffer {
    const key = this.key(password, salt);
    return this.decryptWithKey(data, key);
  }

  protected format(...items: string[]): string {
    return Buffer.allocUnsafe(AbstractSymmetricCrypt.METHOD_SIZE)
      .fill(0x01) // Assuming method size is always 2 bytes
      .toString("binary")
      .concat(items.join(""));
  }

  protected parse(
    payload: Buffer,
    lengths: Record<string, number>
  ): { method?: number; data?: Buffer; [key: string]: any } {
    if (
      payload.length <
      AbstractSymmetricCrypt.METHOD_SIZE + arraySum(lengths)
    ) {
      throw new CryptParseError("Premature data end");
    }
    let pos = AbstractSymmetricCrypt.METHOD_SIZE;

    const result = unpack("vmethod", substrBuffer(payload, 0, pos));

    for (const [key, length] of Object.entries(lengths)) {
      result[key] = substrBuffer(payload, pos, length);
      pos += length;
    }

    result["data"] = substrBuffer(payload, pos);

    return result;
  }
}
