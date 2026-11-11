/** Left-pads a number with zeroes to the requested width. */
export const pad = (n: number, width = 2): string =>
  String(n).padStart(width, "0");

