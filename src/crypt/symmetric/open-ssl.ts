import * as crypto from "crypto";
import { AbstractSymmetricCrypt } from "./abstract-symmetric-crypt";
import { base64Decode } from "../../utils/php/base64";
import { InvalidArgumentError } from "../../errors/invalid-argument-error";
import { DecryptError } from "../errors";

export class OpenSSL extends AbstractSymmetricCrypt {
  public static readonly METHOD: number = 0x0200;

  protected method: string = "aes-256-cbc";
  protected algo: string = "sha256";
  protected options: number = 0;
  protected ivLengths: { [key: string]: number } = {
    ["aes-128-cbc"]: 16,
    ["aes-192-cbc"]: 16,
    ["aes-256-cbc"]: 16,
    ["aes-128-gcm"]: 12,
    ["aes-192-gcm"]: 12,
    ["aes-256-gcm"]: 12,
  };

  constructor(method: string = "aes-256-cbc", algo: string = "sha256") {
    super();

    const validMethods = [
      "aes-128-cbc",
      "aes-192-cbc",
      "aes-256-cbc",
      "aes-128-gcm",
      "aes-192-gcm",
      "aes-256-gcm",
    ];
    if (!validMethods.includes(method)) {
      throw new InvalidArgumentError(`Invalid cipher method "${method}"`);
    }
    this.method = method;
    const validAlgorithms = ["sha256", "sha512"];
    if (!validAlgorithms.includes(algo)) {
      throw new InvalidArgumentError(`Invalid hash method "${algo}"`);
    }
    this.algo = algo;
  }

  public key(password: string, salt?: string): Buffer {
    if (salt === undefined) {
      return base64Decode(
        crypto.createHash(this.algo).update(password).digest("base64")
      );
    }
    return base64Decode(
      crypto.createHmac(this.algo, salt).update(password).digest("base64")
    );
  }

  protected getIv(): string {
    const ivLength = this.getIvLength();
    return crypto.randomBytes(ivLength).toString("hex");
  }

  protected getIvLength(): number {
    switch (this.method) {
      case "aes-128-cbc":
      case "aes-192-cbc":
      case "aes-256-cbc":
        return 16;
      case "aes-128-gcm":
      case "aes-192-gcm":
      case "aes-256-gcm":
        return 12;
      default:
        throw new InvalidArgumentError(`Unsupported method "${this.method}"`);
    }
  }

  public encryptWithKey(data: string, key: Buffer): string {
    throw new Error("Not implemented yet");
  }

  public decryptWithKey(payload: Buffer, key: Buffer): Buffer {
    const { method, iv, data } = this.parse(payload, {
      iv: this.ivLengths[this.method],
    });
    if (method !== OpenSSL.METHOD) {
      throw new DecryptError("Unrecognized payload");
    }

    return this.decode(data ?? Buffer.from(""), this.method, key, iv);
  }

  protected decode(
    input: Buffer,
    method: string,
    key: Buffer,
    iv: Buffer,
    tag?: Buffer
  ) {
    const decipher = crypto.createDecipheriv(method, key, iv);

    if (tag !== undefined) {
      (decipher as crypto.DecipherGCM).setAuthTag(tag);
    }

    return Buffer.concat([decipher.update(input), decipher.final()]);
  }
}
