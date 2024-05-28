export function chunkSplit(
    input: string,
    length = 76,
    separator = "\r\n"
  ): string | null {
    if (length < 1) {
      throw new Error("Chunk length must be greater or equal than 1");
    }
  
    return (
      input?.match(new RegExp(".{0," + length + "}", "g"))?.join(separator) ??
      null
    );
  }
