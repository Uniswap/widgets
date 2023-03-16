import { ErrorCode } from 'constants/eip1193'

export function getReason(error: any): string | undefined {
  let reason: string | undefined
  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }
  return reason
}

export function isUserRejection(error: any): boolean {
  const reason = getReason(error)
  if (
    // EIP-1193
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    // Ethers v5 (https://github.com/ethers-io/ethers.js/commit/d9897e0fdb5f9ca34822929c95a478634cc2a460)
    error?.code === 'ACTION_REJECTED' ||
    // These error messages have been observed in the listed wallets:
    (reason?.match(/request/i) && reason?.match(/reject/i)) || // Rainbow
    reason?.match(/declined/i) || // Frame
    reason?.match(/cancell?ed by user/i) || // SafePal
    reason?.match(/user cancell?ed/i) || // Trust
    reason?.match(/user denied/i) || // Coinbase
    reason?.match(/user rejected/i) // Fireblocks
  ) {
    return true
  }
  return false
}
