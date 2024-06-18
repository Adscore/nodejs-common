export function strlen(input: string | Buffer | null | undefined): number {
  return input?.length ?? 0;
}
