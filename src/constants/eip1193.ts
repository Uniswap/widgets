// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
export enum ErrorCode {
  USER_REJECTED_REQUEST = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
}
