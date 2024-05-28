import { InvalidArgumentError } from "../errors/invalid-argument-error";
import { base64Decode } from "../utils/php/base64";
import { AbstractFormatter } from "./abstract-formatter";

/**
 * Generic Base64 formatter
 */
export class Base64 extends AbstractFormatter {
  public static readonly BASE64_VARIANT_ORIGINAL = 1;
  public static readonly BASE64_VARIANT_ORIGINAL_NO_PADDING = 3;
  public static readonly BASE64_VARIANT_URLSAFE = 5;
  public static readonly BASE64_VARIANT_URLSAFE_NO_PADDING = 7;

  protected variant: number;
  protected strict: boolean;

  /**
   * @param variant Compatible with BASE64_VARIANT_*
   * @param strict Whether to throw exception on decoding errors
   * @throws Error
   */
  constructor(
    variant: number = Base64.BASE64_VARIANT_URLSAFE_NO_PADDING,
    strict: boolean = false
  ) {
    super();
    if (
      ![
        Base64.BASE64_VARIANT_ORIGINAL,
        Base64.BASE64_VARIANT_ORIGINAL_NO_PADDING,
        Base64.BASE64_VARIANT_URLSAFE,
        Base64.BASE64_VARIANT_URLSAFE_NO_PADDING,
      ].includes(variant)
    ) {
      throw new InvalidArgumentError("Invalid base64 variant");
    }
    this.variant = variant;
    this.strict = strict;
  }

  /**
   * Encodes a raw binary string with base64
   * @param value
   * @return string
   * @throws Error
   */
  format(value: string): string {
    switch (this.variant) {
      case Base64.BASE64_VARIANT_ORIGINAL:
        return Buffer.from(value).toString("base64");
      case Base64.BASE64_VARIANT_ORIGINAL_NO_PADDING:
        return Buffer.from(value).toString("base64").replace(/=+$/, "");
      case Base64.BASE64_VARIANT_URLSAFE:
        return Buffer.from(value)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      case Base64.BASE64_VARIANT_URLSAFE_NO_PADDING:
        return Buffer.from(value)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      default:
        throw new InvalidArgumentError("Invalid base64 variant");
    }
  }

  /**
   * Decodes a base64-encoded string into raw binary
   * @param value
   * @return string
   * @throws Error When strict mode is enabled, an exception is thrown in case of unrecognized character
   */
  parse(value: string): Buffer {
    let binary = base64Decode(value);
    if (this.strict && !binary) {
      throw new InvalidArgumentError("Not a valid base64-encoded value");
    }
    return binary;
  }
}
