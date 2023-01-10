/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero(hexNumberString: string) {
  return hexNumberString === '0' || /^0x0*$/.test(hexNumberString)
}
