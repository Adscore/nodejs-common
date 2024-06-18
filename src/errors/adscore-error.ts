export class AdscoreError extends Error {
  constructor(message: string, cause?: Error | unknown) {
    // @ts-ignore cause is supported from ES2022 and this packed targets ES2016
    super(message, { cause });
  }
}
