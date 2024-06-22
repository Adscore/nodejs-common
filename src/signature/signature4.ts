import { AsymmetricOpenSSL } from "../crypt";
import { Judge } from "../definition";
import { AbstractFormatter } from "../formatter";
import { isset, strlen, substr, substrBuffer, unpack } from "../utils";
import { AbstractSignature, Payload } from "./abstract-signature";
import * as crypto from "node:crypto";
import { VerifyError, VersionError } from "./error";
import { ParseError } from "../errors/parse-error";
import { arrayKeyExists } from "../utils/php/array-key-exists";
import { sprintf } from "../utils/php/sprintf";
import { AdscoreError } from "../errors/adscore-error";
import { empty } from "../utils/php/empty";
import { hashEquals } from "../utils/php/hash-equals";
import { inet_ntop, inet_pton } from "locutus/php/network";
import { ip2long, long2ip } from "../utils/php/ip";

/**
 * Signature v4 parser
 */
export class Signature4 extends AbstractSignature {
  public readonly VERSION: number = 4;

  private readonly FIELD_IDS: Record<
    number,
    { name: string | null; type: string }
  > = {
    /* ulong fields */
    0x00: { name: "requestTime", type: "ulong" },
    0x01: { name: "signatureTime", type: "ulong" },

    0x10: { name: "ipv4", type: "ulong" } /* Debug field */,
    /* ushort fields */
    0x40: { name: null, type: "ushort" } /* Reserved for future use */,
    /* uchar fields */
    0x80: { name: "masterSignType", type: "uchar" },
    0x81: { name: "customerSignType", type: "uchar" },
    /* string fields */
    0xc0: { name: "masterToken", type: "string" },
    0xc1: { name: "customerToken", type: "string" },
    0xc2: { name: "masterToken6", type: "string" },
    0xc3: { name: "customerToken6", type: "string" },
    0xc4: { name: "ipv6", type: "string" },
    0xc5: { name: "masterChecksum", type: "string" },

    0xd0: { name: "userAgent", type: "string" } /* Debug field */,
  };

  public HASH_SHA256 = 1; /* Default HASH: using SHA256 */
  public SIGN_SHA256 = 2; /* Default SIGN: using SHA256 */

  private SIMPLE_TYPES: Record<string, { unpack: string; size: number }> = {
    uchar: { unpack: "Cx/Cv", size: 2 },
    ushort: { unpack: "Cx/nv", size: 3 },
    ulong: { unpack: "Cx/Nv", size: 5 },
    string: { unpack: "Cx/nv", size: 3 /* + length(value) */ },
  };

  protected verificationData: Record<string, any> | null = null;

  public __construct(payload: Payload | null = null) {
    this.payload = payload;
  }

  // TODO: fix/remove params types in separate commit
  /**
   * Simplified signature parsing/validation
   * @param string signature
   * @param array ipAddresses
   * @param string userAgent
   * @param string cryptKey
   * @param AbstractFormatter|null formatter
   * @return self
   */
  public static createFromRequest(
    signature: string,
    ipAddresses: string[],
    userAgent: string,
    cryptKey: Buffer | string,
    formatter: AbstractFormatter | null = null
  ): AbstractSignature {
    const obj = new Signature4();
    obj.parse(signature, formatter);
    obj.verify(ipAddresses, userAgent, cryptKey);
    return obj;
  }

  public parse(
    signature: string,
    formatter: AbstractFormatter | null = null
  ): void {
    formatter ??= this.getDefaultFormatter();
    this.payload = this.parseStructure(signature, formatter);
  }

  protected getHashBase(
    result: number,
    requestTime: number,
    signatureTime: number,
    ipAddress: string,
    userAgent: string
  ): string {
    return [result, requestTime, signatureTime, ipAddress, userAgent].join(
      "\n"
    );
  }

  protected signData(
    data: string,
    privateKey: string,
    algorithm: string = "sha256"
  ): Buffer {
    const crypt = new AsymmetricOpenSSL(algorithm);
    return crypt.sign(data, privateKey);
  }

  protected verifyData(
    data: string,
    signature: string,
    publicKey: Buffer | string,
    algorithm: string = "sha256"
  ): boolean {
    const crypt = new AsymmetricOpenSSL(algorithm);
    return crypt.verify(data, signature, publicKey);
  }

  protected hashData(
    data: string,
    salt: Buffer | string,
    algorithm: string = "sha256"
  ): Buffer {
    return crypto.createHmac(algorithm, salt).update(data).digest();
  }

  public getVerificationData(): Payload | null {
    return this.verificationData;
  }

  /**
   * Verifies signature
   * @param array ipAddresses
   * @param string userAgent
   * @param string cryptKey
   * @param string signRole
   * @param array|null results
   * @return bool
   * @throws VerifyError
   */
  public verify(
    ipAddresses: string[],
    userAgent: string,
    cryptKey: Buffer | string,
    signRole: string = "customer",
    results: any | null = null
  ): boolean {
    // TODO: any
    results ??= Judge.RESULTS;
    if (!isset(this.payload?.[signRole + "Token"])) {
      throw new VerifyError("Invalid sign role");
    }

    const signType = this.payload?.[signRole + "SignType"];

    for (let ipAddress of ipAddresses) {
      /* Detect whether it's IPv4 or IPv6, normalize */
      const longIp = ip2long(ipAddress);

      ipAddress = "";

      let token: string | null = null;

      let v = 4;
      if (longIp !== false) {
        ipAddress = long2ip(longIp);
        token = this.payload?.[signRole + "Token"];
      } else {
        ipAddress = inet_ntop(inet_pton(ipAddress));
        token = this.payload?.[signRole + "Token6"] ?? null;
        v = 6;
        if (token === null) {
          continue;
        }
      }

      /* Check all possible results */
      for (let result in results) {
        let meta = results[Number(result)];

        meta = typeof meta === "object" ? meta : {};
        const signatureBase = this.getHashBase(
          Number(result),
          this.payload?.["requestTime"],
          this.payload?.["signatureTime"],
          ipAddress,
          userAgent
        );
        switch (signType) {
          case this.HASH_SHA256:
            const xToken = this.hashData(signatureBase, cryptKey, "sha256");
            if (hashEquals(xToken, Buffer.from(token as string))) {
              this.verificationData = {
                verdict: meta["verdict"] ?? null,
                result: Number(result),
                [`ipv${v}.ip`]: ipAddress,
                embeddedIpV6: this.verifyEmbeddedIpv6(
                  Number(result),
                  cryptKey,
                  userAgent,
                  signRole
                ),
              };
              this.result = Number(result);
              return true;
            }
            break;
          case this.SIGN_SHA256:
            const xValid = this.verifyData(
              signatureBase,
              token as string,
              cryptKey,
              "sha256"
            );
            if (xValid) {
              this.verificationData = {
                verdict: meta["verdict"] ?? null,
                result: Number(result),
                "ipv{v}.ip": ipAddress,
                embeddedIpV6: this.verifyEmbeddedIpv6(
                  Number(result),
                  cryptKey,
                  userAgent,
                  signRole
                ),
              };
              this.result = Number(result);
              return true;
            }
            break;
          default:
            throw new VerifyError(
              "Unrecognized sign type: " + signType?.toString()
            );
        }
      }
    }
    throw new VerifyError("No verdict matched", 10);
  }

  /**
   * Allows to transport IPv6 over sessions
   * @param int result
   * @param string key
   * @param string userAgent
   * @param string signRole
   * @return string|null
   */
  protected verifyEmbeddedIpv6(
    result: number,
    key: Buffer | string,
    userAgent: string,
    signRole: string
  ): string | null {
    if (
      !isset(this.payload?.["ipV6"]) ||
      empty(this.payload?.["ipV6"]) ||
      !isset(this.payload?.[signRole + "TokenV6"]) ||
      empty(this.payload?.[signRole + "TokenV6"]) ||
      !isset(this.payload?.[signRole + "Checksum"]) ||
      !isset(this.payload?.[signRole + "SignType"])
    ) {
      return null;
    }

    const checksum = this.hashData(
      this.payload?.[signRole + "Token"] + this.payload?.[signRole + "TokenV6"],
      key,
      "haval128,4"
    );
    if (!hashEquals(checksum, this.payload?.[signRole + "Checksum"])) {
      return null;
    }

    const ipAddress = inet_ntop(this.payload?.["ipV6"]);
    if (empty(ipAddress)) {
      return null;
    }

    const signType = this.payload?.[signRole + "SignType"];
    const signatureBase = this.getHashBase(
      result,
      this.payload?.["requestTime"],
      this.payload?.["signatureTime"],
      ipAddress,
      userAgent
    );
    switch (signType) {
      case this.HASH_SHA256:
        const xToken = this.hashData(signatureBase, key, "sha256");
        if (hashEquals(xToken, this.payload?.[signRole + "TokenV6"])) {
          return ipAddress;
        }
      /* Customer verification unsupported */
    }
    return null;
  }

  private readStructureField(
    signature: Buffer,
    type: string
  ): { result: number | bigint | Buffer; signatureSubarray: Buffer } {
    if (!isset(this.SIMPLE_TYPES[type])) {
      throw new ParseError('Unsupported variable type "' + type + '"');
    }

    const unpackFmtStr = this.SIMPLE_TYPES[type]["unpack"];
    const fieldSize = this.SIMPLE_TYPES[type]["size"];

    switch (type) {
      case "uchar":
      case "ushort":
      case "ulong":
        const v = unpack(unpackFmtStr, signature)["v"] ?? null;
        if (v === null) {
          throw new ParseError("Premature end of signature");
        }
        return {
          result: v,
          signatureSubarray: substrBuffer(signature, fieldSize),
        };
      case "string":
        let length = unpack(unpackFmtStr, signature)["v"] ?? null;

        if (length === null) {
          throw new ParseError("Premature end of signature");
        }

        if (Number(length) & 0x8000) {
          /* For future use */
          length = Number(length) & 0xff;
        }

        const v2 = substrBuffer(signature, fieldSize, Number(length));

        if (strlen(v2 as Buffer) !== length) {
          throw new ParseError("Premature end of signature");
        }

        return {
          result: v2,
          signatureSubarray: substrBuffer(signature, fieldSize + length),
        };
      default:
        throw new ParseError('Unsupported variable type "' + type + '"');
    }
  }

  /**
   * Decodes physical layer of signature
   * @param string input
   * @return array
   * @throws ParseError
   * @throws VersionError
   */
  protected parseStructure(
    input: string,
    formatter: AbstractFormatter
  ): Payload {
    let signature = formatter.parse(input);

    if (!signature?.length) {
      throw new ParseError("Not a valid base64 signature payload");
    }

    const data = unpack("Cversion/CfieldNum", signature);

    if (data["version"] !== this.VERSION) {
      throw new VersionError(`Signature version not supported`);
    } else {
      signature = substrBuffer(signature, 2);
    }

    for (let i = 0; i < Number(data.fieldNum); i++) {
      const fieldId = Number(unpack("CfieldId", signature)["fieldId"]) ?? null;

      if (fieldId === null) {
        throw new ParseError("Premature end of signature");
      }

      let fieldTypeDef: {
        type: string | null;
        name: string | null;
      } = { name: null, type: null };

      if (!arrayKeyExists(fieldId, this.FIELD_IDS)) {
        /* Determine field name and size */

        const t = this.FIELD_IDS[fieldId & 0xc0]["type"];

        fieldTypeDef = {
          /* Guess field size, but leave unrecognized */ type: t,
          name: sprintf("%s%02x", t, i),
        };
      } else {
        fieldTypeDef = this.FIELD_IDS[fieldId];
      }

      if (fieldTypeDef.name === null || fieldTypeDef.type === null) {
        throw new ParseError(
          "Invalid Field ID",
          new AdscoreError("fieldTypeDef name or type is null")
        );
      }

      const { result, signatureSubarray } = this.readStructureField(
        signature,
        fieldTypeDef["type"]
      );

      signature = signatureSubarray;

      data[fieldTypeDef["name"]] = result;
    }

    delete data.fieldNum;

    return data;
  }
}
