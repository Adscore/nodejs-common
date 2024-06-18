import { AbstractFormatter } from "../formatter/abstract-formatter";
import { Base64 } from "../formatter/base64";
import { substrBuffer } from "../utils/php";
import { VerifyError } from "./error/verify-error";
import { CryptKeyCallback } from "./signature5";

export type Payload = Record<string, any>;

/**
 * Abstract signature
 */
export abstract class AbstractSignature {
  protected payload: Payload | null = null;
  protected result: number | null = null;

  protected structType?: string;
  protected encryptionType?: string;

  /**
   * Retrieve embedded payload
   * @return Payload | null
   */
  public getPayload(): Payload | null {
    return this.payload;
  }

  /**
   * Embed new payload
   * @param payload
   * @return void
   */
  public setPayload(payload: Payload): void {
    this.payload = payload;
  }

  /**
   * Returns verification result
   */
  public getResult(): number {
    if (this.result === null) {
      throw new VerifyError("Result unavailable for unverified signature");
    }
    return this.result;
  }

  /**
   * Simplified signature parsing/validation
   * @param signature Signature content
   * @param ipAddresses Array of client's IP addresses
   * @param userAgent Client's User Agent
   * @param cryptKey Signature decoding key
   * @param formatter Optional formatter (if signature content is not a standard Base64)
   * @return AbstractSignature
   */
  public static createFromRequest(
    signature: string,
    ipAddresses: Array<string>,
    userAgent: string,
    cryptKey: Buffer | CryptKeyCallback | string,
    formatter: AbstractFormatter | null = null
  ): AbstractSignature {
    throw new Error("Not implemented");
  }

  /**
   * Returns default formatter
   * @return AbstractFormatter
   */
  protected getDefaultFormatter(): AbstractFormatter {
    return new Base64(Base64.BASE64_VARIANT_URLSAFE_NO_PADDING, true);
  }

  public bytesCompare(
    known: Buffer | null,
    user: Buffer | null,
    n: number
  ): boolean {
    if (known === null || user === null) {
      return false;
    }

    if (known.length < n || user.length < n) {
      return false;
    }
    return this.hashEquals(substrBuffer(known, 0, n), substrBuffer(user, 0, n));
  }

  private hashEquals(known: Buffer, user: Buffer): boolean {
    return known.equals(user);
  }
}
