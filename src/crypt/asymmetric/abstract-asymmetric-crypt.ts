
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
    throw new Error("Not supported");
  }

  /**
   * Expands compacted data to PEM format
   * @param {string} data compacted key data
   * @param {number} lineLength line length for PEM encoding (default 64)
   * @returns {string} PEM formatted key
   */
  public static expandPem(data: string, lineLength: number = 64): string {
    throw new Error("Not supported");
  }

  protected static parsePem(key: string): { label: string; data: Buffer } {
    throw new Error("Not supported");
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
    throw new Error("Not supported");
  }
}
