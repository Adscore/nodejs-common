import assert from "assert";
import { AbstractSymmetricCrypt } from "../crypt/symmetric/abstract-symmetric-crypt";
import { AbstractFormatter } from "../formatter/abstract-formatter";
import { AbstractStruct } from "../struct/abstract-struct";
import { isset } from "../utils/php/isset";
import { pack } from "../utils/php/pack";
import { strcmp } from "../utils/php/strcmp";
import { strlen } from "../utils/php/strlen";
import { unpack } from "../utils/php/unpack";
import { AbstractSignature, Payload } from "./abstract-signature";
import { CryptFactory } from "../crypt/crypt-factory";
import { StructFactory } from "../struct/struct.factory";
import { inet_pton } from "inet_xtoy";
import { VerifyError } from "./error/verify-error";
import { SignatureParseError } from "./error/parse-error";
import { substrBuffer } from "../utils/php";

export type CryptKeyCallback = (zoneId: number | bigint) => Buffer | string;

/**
 * Signature v5 envelope/parser
 */
export class Signature5 extends AbstractSignature {
  public VERSION = 5;
  protected HEADER_LENGTH = 11;

  protected zoneId: number | bigint | undefined;

  /**
   * Creates a new signature envelope
   */
  constructor(zoneId?: bigint, payload?: Payload) {
    super();
    this.zoneId = zoneId;
    this.payload = payload ?? null;
  }

  /**
   * Retrieve zone ID
   * @return int|null
   */
  public getZoneId(): bigint | number | undefined {
    return this.zoneId;
  }

  /**
   * Embed new zone ID
   * @param int zoneId
   * @return void
   */
  public setZoneId(zoneId: bigint): void {
    this.zoneId = zoneId;
  }

  /**
   * Simplified signature parsing/validation
   * @param string signature
   * @param array ipAddresses
   * @param string userAgent
   * @param Closure|string cryptKey
   * @param AbstractFormatter|null formatter
   * @return self
   */
  public static createFromRequest(
    signature: string,
    ipAddresses: Array<string>,
    userAgent: string,
    cryptKey: Buffer | CryptKeyCallback,
    formatter: AbstractFormatter | null = null
  ): AbstractSignature {
    const obj = new Signature5();
    obj.parse(signature, this.toCallback(cryptKey), formatter);

    obj.verify(ipAddresses, userAgent);
    return obj;
  }

  private static toCallback(
    input: Buffer | CryptKeyCallback
  ): CryptKeyCallback {
    if (Buffer.isBuffer(input)) {
      return (zoneId: number | bigint) => input;
    }

    return input;
  }

  /**
   * Default V5 signature validator
   * @param array result
   * @param array ipAddresses
   * @param string userAgent
   * @throws Error
   */
  public verify(ipAddresses: Array<string>, userAgent: string): boolean {
    let matchingIp = null;
    for (const ipAddress of ipAddresses) {
      const nIpAddress = inet_pton(ipAddress);

      if (
        // ip v4
        (isset(this.payload?.["ipv4.ip"]) &&
          this.bytesCompare(
            nIpAddress,
            inet_pton(this.payload?.["ipv4.ip"]),
            this.payload?.["ipv4.v"] ?? 4
          )) ||
        // ip v6
        (isset(this.payload?.["ipv6.ip"]) &&
          this.bytesCompare(
            nIpAddress,
            inet_pton(this.payload?.["ipv6.ip"]),
            this.payload?.["ipv6.v"] ?? 16
          ))
      ) {
        matchingIp = ipAddress;
        break;
      }
    }

    if (matchingIp === null) {
      throw new VerifyError("Signature IP mismatch");
    }

    if (!isset(this.payload?.["b.ua"])) {
      throw new VerifyError("Signature contains no user agent");
    }

    if (strcmp(this.payload?.["b.ua"], userAgent) !== 0) {
      throw new VerifyError("Signature user agent mismatch");
    }

    this.result = this.payload?.["result"] ?? null;

    return true;
  }

  /**
   * Produce an encrypted signature
   * @param AdScore\Common\Struct\AbstractStruct struct
   * @param AdScore\Common\Crypt\Symmetric\AbstractSymmetricCrypt crypt
   * @param string cryptKey
   * @param AdScore\Common\Formatter\AbstractFormatter formatter		Signature formatter
   * @return string
   */
  public format(
    struct: AbstractStruct,
    crypt: AbstractSymmetricCrypt,
    cryptKey: Buffer,
    formatter: AbstractFormatter | null = null
  ): string {
    throw new Error("Not supported");
  }

  /**
   * Parses and decodes a signature
   * @param string signature Formatted signature
   * @param Closure onCryptKeyRequest Zone ID is passed as parameter, this callback should return a decryption key
   * @param AdScore\Common\Formatter\AbstractFormatter formatter Signature format decoder
   */
  public parse(
    signature: string,
    onCryptKeyRequest: (zoneId: bigint | number) => Buffer | string,
    formatter: AbstractFormatter | null = null
  ): void {
    formatter ??= this.getDefaultFormatter();
    const payload = formatter?.parse(signature);
    if (payload.length <= this.HEADER_LENGTH) {
      throw new SignatureParseError("Malformed signature");
    }

    const { version, length, zone_id } = unpack(
      "Cversion/nlength/Jzone_id",
      Buffer.from(payload ?? [])
    );
    if (version !== this.VERSION) {
      throw new SignatureParseError("Invalid signature version");
    }

    const encryptedPayload = substrBuffer(
      payload,
      this.HEADER_LENGTH,
      Number(length)
    );

    if (encryptedPayload.length < Number(length)) {
      throw new SignatureParseError("Truncated signature payload");
    }

    this.payload = this.decryptPayload(
      encryptedPayload,
      onCryptKeyRequest(zone_id as bigint)
    ) as any;

    this.zoneId = zone_id as bigint;
  }

  /**
   * Decrypts and unpacks payload
   * @param string payload
   * @param string key
   * @return array
   */
  protected decryptPayload(payload: Buffer, key: Buffer | string): object {
    const crypt = CryptFactory.createFromPayload(payload);
    const decryptedPayload = crypt.decryptWithKey(payload, key);

    const struct = StructFactory.createFromPayload(decryptedPayload.toString());

    const unpackedPayload = struct.unpack(decryptedPayload);

    if (typeof unpackedPayload !== "object") {
      throw new SignatureParseError(
        "Unexpected payload type " + typeof unpackedPayload
      );
    }

    this.structType = struct.constructor.name;
    this.encryptionType = crypt.constructor.name;

    return unpackedPayload;
  }
}
