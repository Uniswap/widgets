import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Deferrable } from '@ethersproject/properties'
import { JsonRpcProvider } from '@ethersproject/providers'
import { poll } from '@ethersproject/web'

import { getWalletMeta } from './meta'

export * from './meta'
export * from './signing'

function isUniswapWallet(provider: JsonRpcProvider): boolean {
  return getWalletMeta(provider)?.name === 'Uniswap Wallet'
}

/**
 * Sends a transaction, optionally including a gas limit.
 *
 * The ethers sendTransaction implementation first checks the blockNumber, which causes a delay and may inhibit
 * deep-linking behavior on iOS. This wrapper works around that by optionally estimating gas (another source of delay),
 * and by sending the transaction as an unchecked transaction.
 * @see https://docs.walletconnect.com/2.0/swift/guides/mobile-linking#ios-app-link-constraints.
 */
export async function sendTransaction(
  provider: JsonRpcProvider,
  transaction: Deferrable<TransactionRequest>,
  gasMargin = 0,
  skipGasLimit = isUniswapWallet(provider)
): Promise<TransactionResponse> {
  const signer = provider.getSigner()

  let gasLimit: BigNumber | undefined
  if (!skipGasLimit) {
    gasLimit = await signer.estimateGas(transaction)
    if (gasMargin) {
      gasLimit = gasLimit.add(gasLimit.mul(Math.floor(gasMargin * 100)).div(100))
    }
  }

  const hash = await signer.sendUncheckedTransaction({ ...transaction, gasLimit })

  try {
    // JSON-RPC only provides an opaque transaction hash, so we poll for the actual transaction.
    // Polling continues until a defined value is returned (see https://docs.ethers.org/v5/api/utils/web/#utils-poll).
    // NB: sendTransaction is a modified version of JsonRpcProvider.sendTransaction - see the original implementation.
    return await poll<TransactionResponse>(
      (async () => {
        const tx = await provider.getTransaction(hash)
        if (tx === null) return undefined
        return provider._wrapTransaction(tx, hash)
      }) as () => Promise<TransactionResponse>,
      { oncePoll: provider }
    )
  } catch (error) {
    error.transactionHash = hash
    throw error
  }
}
