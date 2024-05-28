import { InvalidArgumentError } from "../../errors/invalid-argument-error";
import { VerifyError } from "../../signature/error/verify-error";
import { base64Decode } from "../../utils/php/base64";
import { AbstractAsymmetricCrypt } from "./abstract-asymmetric-crypt";
import * as crypto from "node:crypto";

export class AsymmetricOpenSSL extends AbstractAsymmetricCrypt {
  protected algo: string = "sha256";
  protected options: number = 1; // Placeholder for OPENSSL_RAW_DATA

  constructor(algo: string = "sha256") {
    super();
    if (!crypto.getHashes().includes(algo)) {
      throw new InvalidArgumentError(`Invalid hash method "${algo}"`);
    }
    this.algo = algo;
  }

  /**
   * Verify signature
   * @param data The string of data used to generate the signature previously
   * @param signature A raw binary string
   * @param publicKey OpenSSL asymmetric key
   * @return boolean
   * @throws VerifyError
   */
  public verify(data: string, signature: string, publicKey: string): boolean {
    if (
      crypto.verify(
        this.algo,
        base64Decode(data),
        publicKey,
        base64Decode(signature)
      )
    ) {
      throw new VerifyError("Signature verification error");
    }

    return true;
  }

  /**
   * Generate signature
   * @param data The string of data you wish to sign
   * @param privateKey OpenSSL asymmetric key
   * @return string Computed signature
   */
  public sign(data: string, privateKey: string): Buffer {
    const privateKeyPem = AbstractAsymmetricCrypt.expandPem(privateKey);

    return crypto.sign(this.algo, base64Decode(data), privateKeyPem);
  }

  /**
   * Create EC keypair
   * @param curveName Curve name
   * @return Compacted private key
   */
  public static createEcPrivateKey(curveName: string = "prime256v1"): Buffer {
    throw new InvalidArgumentError("Not implemented yet");
  }

  /**
   * Retrieve public key in PEM format from compacted private key
   * @param data Compacted key
   * @return Public key in PEM format
   */
  public static getPublicKeyPem(data: string): string {
    throw new Error("Not implemented yet");
  }
}
