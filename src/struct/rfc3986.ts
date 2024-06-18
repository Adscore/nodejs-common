import { AbstractStruct } from "./abstract-struct";

export const Rfc3986Type = "H";

/**
 * RFC 3986 serialization adapter
 */
export class Rfc3986 extends AbstractStruct {
  public readonly TYPE: string = Rfc3986Type;

  /**
   * Encodes structure as URL-encoded query string
   * @param array $data
   * @return string
   */
  public pack(data: string): string {
    throw new Error("Not supported");
  }

  /**
   * Parses string as if it were the query string passed via a URL
   * @param string $data
   * @return array
   */
  public unpack(data: Buffer): string {
    const searchParams = new URLSearchParams(data.toString());

    const res = Array.from(searchParams.entries()).reduce((curr, prev) => {
      curr[prev[0]] = prev[1];

      return curr;
    }, {} as any);

    return res;
  }
}
