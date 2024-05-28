import { AbstractSymmetricCrypt } from "./abstract-symmetric-crypt";
import _sodium from "libsodium-wrappers";
import { strlen } from "../../utils/php/strlen";
import { DecryptError } from "../errors";

const sodium = _sodium;

/**
 * Sodium-based symmetric cryptography
 */
export class Secretbox extends AbstractSymmetricCrypt {
  public static readonly METHOD = 0x0101;

  /**
   * Generates secretbox key from password and salt
   */
  public key(password: string, salt: string | null = null): Buffer {
    if (salt === null) {
      return Buffer.from(
        sodium.crypto_pwhash_str(
          password,
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
        )
      );
    }

    while (strlen(salt) < sodium.crypto_pwhash_SALTBYTES) {
      salt += salt;
    }

    return Buffer.from(
      sodium.crypto_pwhash(
        sodium.crypto_secretbox_KEYBYTES,
        password,
        Buffer.from(salt).subarray(0, sodium.crypto_pwhash_SALTBYTES),
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_DEFAULT
      )
    );
  }

  /**
   * Encrypt using key
   * @param string data	Content to encrypt
   * @param string key	Encryption key
   * @return string		Encrypted payload
   * @throws InternalError
   */
  public encryptWithKey(data: string, key: Buffer): string {
    throw new Error("Not implemented yet");
  }

  /**
   * Decrypt using key
   * @param string payload	Content to decrypt
   * @param string key       Decryption key
   * @return string           Decrypted payload
   * @throws DecryptError
   * @throws InternalError
   */
  public decryptWithKey(payload: Buffer, key: Buffer): Buffer {
    const {
      method: method,
      iv: iv,
      data: data,
    } = this.parse(payload, { iv: sodium.crypto_secretbox_NONCEBYTES });

    if (method !== Secretbox.METHOD) {
      throw new DecryptError("Unrecognized payload");
    }

    if (data === undefined) {
      throw new DecryptError("Not a valid payload");
    }

    const decryptedData = sodium.crypto_secretbox_open_easy(
      new Uint8Array(data),
      iv,
      key
    );

    return Buffer.from(decryptedData);
  }
}
