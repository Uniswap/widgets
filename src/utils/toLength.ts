/**
 * Converts a number to a CSS length string. If the value is not a number, it is returned as is.
 * If the value is a number, we treat it like a pixel amount.
 *
 * @param length CSS length value, either a string like "100%" or "100px" or a number like 100
 */
export default function toLength(length: number | string): string {
  if (isNaN(Number(length))) {
    return length as string
  } else {
    return `${length}px`
  }
}
