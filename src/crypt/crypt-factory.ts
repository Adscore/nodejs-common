import { InvalidArgumentError } from "../errors/invalid-argument-error";
import { substrBuffer } from "../utils/php";
import { pack } from "../utils/php/pack";
import { OpenSSL } from "./symmetric/open-ssl";
import { OpenSSLAEAD } from "./symmetric/open-ssl-aead";
import { Secretbox } from "./symmetric/secretbox";

export type CryptType = "OpenSSL" | "OpenSSLAEAD" | "Secretbox";

export class CryptFactory {
  /**
   * Returns Crypt instance
   * @param string $name
   * @return OpenSSL|Secretbox
   */
  public static create(name: CryptType | string | Buffer) {
    switch (name.toString()) {
      case pack("v", OpenSSL.METHOD).toString():
      case "OpenSSL":
      case "openssl":
        return new OpenSSL();
      case pack("v", OpenSSLAEAD.METHOD).toString():
      case "OpenSSLAEAD":
      case "opensslaead":
        return new OpenSSLAEAD();
      case pack("v", Secretbox.METHOD).toString():
      case "Secretbox":
      case "secretbox":
        return new Secretbox();
      default:
        throw new InvalidArgumentError("Unsupported crypt class");
    }
  }

  /**
   * Returns Crypt instance based on payload header
   * @param string $payload
   * @return OpenSSL|Secretbox
   */
  public static createFromPayload(payload: Buffer) {
    const header = substrBuffer(payload, 0, 2);
    return CryptFactory.create(header);
  }

  /**
   * Returns Crypt instance based on algorithm/library combination ID
   * @param int $code
   * @return object
   */
  public static createFromId(code: number) {
    const name = pack("v", code);
    return CryptFactory.create(name);
  }
}
