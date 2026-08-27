/** Tiny classnames joiner — avoids pulling in a dependency for this. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
