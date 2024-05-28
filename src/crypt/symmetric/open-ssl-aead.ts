import { DecryptError } from "../errors";
import { OpenSSL } from "./open-ssl";

/**
 * OpenSSL-based symmetric cryptography
 *
 */
export class OpenSSLAEAD extends OpenSSL {
  public static readonly METHOD: number = 0x0201;

  protected tagLength = 16;

  public constructor() {
    super("aes-256-gcm");
  }

  /**
   * Decrypt using key
   *
   * @param string payload       Content to decrypt
   * @param string key           Decryption key
   * @param string aad           Additional authentication data
   * @return string               Decrypted payload
   * @throws DecryptError
   */
  public decryptWithKey(
    payload: Buffer,
    key: Buffer,
    aad: string = ""
  ): Buffer {
    const {
      method: method,
      iv: iv,
      tag: tag,
      data: data,
    } = this.parse(payload, {
      iv: this.ivLengths[this.method],
      tag: this.tagLength,
    });


    if (method !== OpenSSLAEAD.METHOD) {
      throw new DecryptError("Unrecognized payload");
    }

    return this.decode(data ?? Buffer.from(""), this.method, key, iv, tag);
  }
}
