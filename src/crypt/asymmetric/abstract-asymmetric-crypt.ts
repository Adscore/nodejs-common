import { arraySearch } from "../../utils/php/array-search";
import { base64Decode, base64Encode } from "../../utils/php/base64";
import { chr } from "../../utils/php/chr";
import { chunkSplit } from "../../utils/php/chunk-split";
import { pack } from "../../utils/php/pack";
import { strpos } from "../../utils/php/strpos";
import { substr } from "../../utils/php/substr";
import { unpack } from "../../utils/php/unpack";
import { CryptParseError } from "../errors";

export class AbstractAsymmetricCrypt {
  protected static LABELS: Record<number, string | null> = {
    0: "RSA PRIVATE KEY",
    1: "DSA PRIVATE KEY",
    2: "DH PRIVATE KEY",
    3: "EC PRIVATE KEY",
    10: "CERTIFICATE",
    11: "PUBLIC KEY",
    255: null, // Custom
  };

  /**
   * Compacts PEM key for storage
   * @param {string} key PEM formatted key
   * @returns {string} compacted key data
   */
  protected static compactPem(key: string): Buffer {
    const data = this.parsePem(key);
    const type = arraySearch(data.label, this.LABELS);

    if (type !== null) {
      return Buffer.concat([pack("C", type), data.data]);
    } else {
      return Buffer.concat([
        pack("C", 255),
        Buffer.from(data.label),
        Buffer.from(chr(0)),
        data.data,
      ]);
    }
  }

  /**
   * Expands compacted data to PEM format
   * @param {string} data compacted key data
   * @param {number} lineLength line length for PEM encoding (default 64)
   * @returns {string} PEM formatted key
   */
  public static expandPem(data: string, lineLength: number = 64): string {
    if (data.startsWith("-----BEGIN ")) {
      return data;
    }
    if (data.length < 3) {
      throw new CryptParseError("Key corrupted");
    }
    const { type } = unpack("Ctype", Buffer.from(data, "base64"));
    if (!this.LABELS[type as number]) {
      throw new CryptParseError("Invalid key type");
    }
    if (type === 255) {
      const p = strpos(data, chr(0), 1);
      return AbstractAsymmetricCrypt.encodePem(
        substr(data, p + 1),
        substr(data, 1, p - 1),
        lineLength
      );
    } else {
      return AbstractAsymmetricCrypt.encodePem(
        substr(data, 1),
        AbstractAsymmetricCrypt.LABELS[type as number],
        lineLength
      );
    }
  }

  protected static parsePem(key: string): { label: string; data: Buffer } {
    const data = key
      .trim()
      .split("\n")
      .map((line) => line.trim());
    let matches: RegExpExecArray | null;

    matches = /^-----BEGIN ([\w\s]+)-----$/.exec(data[0]);
    if (!matches) {
      throw new CryptParseError("Malformed PEM header");
    }
    const label = matches[1];

    matches = /^-----END ([\w\s]+)-----$/.exec(data[data.length - 1]);
    if (!matches) {
      throw new CryptParseError("Malformed PEM footer");
    }
    if (label !== matches[1]) {
      throw new CryptParseError("PEM header does not match footer");
    }

    const base64Data = data.slice(1, -1).join("");
    const decodedData = base64Decode(base64Data);

    return {
      label: label,
      data: decodedData,
    };
  }

  /**
   * Builds PEM format from key data
   * @param {string} data key data
   * @param {string} label key label
   * @param {number} lineLength line length for PEM encoding (default 64)
   * @returns {string} PEM formatted key
   */
  protected static encodePem(
    data: string,
    label: string | null,
    lineLength: number = 64
  ): string {
    return (
      `-----BEGIN ${label ?? ""}-----\n` +
      chunkSplit(base64Encode(data), lineLength, "\n") +
      `-----END ${label ?? ""}-----\n`
    );
  }
}
