/**
 * Abstract Formatter
 */
export abstract class AbstractFormatter {
  /**
   * Binary to ASCII conversion
   * @param value
   * @return string
   */
  abstract format(value: string): string;

  /**
   * ASCII to binary conversion
   */
  abstract parse(value: string): Buffer;
}
