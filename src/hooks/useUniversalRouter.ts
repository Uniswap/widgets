import { BigNumber } from '@ethersproject/bignumber'
import { TransactionRequest, TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { sendTransaction } from '@uniswap/conedison/provider/index'
import { Percent } from '@uniswap/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { FeeOptions, toHex } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { ErrorCode } from 'constants/eip1193'
import { TX_GAS_MARGIN } from 'constants/misc'
import { SwapError } from 'errors'
import { useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import isZero from 'utils/isZero'
import { getReason, swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

import { PermitSignature } from './usePermitAllowance'

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

function didUserReject(error: any): boolean {
  const reason = getReason(error)
  if (
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    (reason?.match(/request/i) && reason?.match(/reject/i)) || // For Rainbow
    reason?.match(/declined/i) || // For Frame
    reason?.match(/cancelled by user/i) || // For SafePal
    reason?.match(/user denied/i) // For Coinbase
  ) {
    return true
  }
  return false
}

/**
 * Returns a callback to submit a transaction to the universal router.
 *
 * The callback returns the TransactionResponse if the transaction was submitted,
 * or undefined if the user rejected the transaction.
 **/
export function useUniversalRouterSwapCallback(trade: InterfaceTrade | undefined, options: SwapOptions) {
  const { account, chainId, provider } = useWeb3React()

  return useCallback(async (): Promise<TransactionResponse | null> => {
    let tx: TransactionRequest
    let response: TransactionResponse
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')

      const { calldata: data, value } = SwapRouter.swapERC20CallParameters(trade, {
        slippageTolerance: options.slippageTolerance,
        deadlineOrPreviousBlockhash: options.deadline?.toString(),
        inputTokenPermit: options.permit,
        fee: options.feeOptions,
      })
      tx = {
        from: account,
        to: UNIVERSAL_ROUTER_ADDRESS(chainId),
        data,
        // TODO: universal-router-sdk returns a non-hexlified value.
        ...(value && !isZero(value) ? { value: toHex(value) } : {}),
      }

      response = await sendTransaction(provider, tx, TX_GAS_MARGIN)
    } catch (swapError) {
      if (didUserReject(swapError)) {
        return null
      }
      const message = swapErrorToUserReadableMessage(swapError)
      throw new SwapError({
        message,
      })
    }
    if (tx.data !== response.data) {
      throw new SwapError({
        message: t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`,
      })
    }
    return response
  }, [
    account,
    chainId,
    options.deadline,
    options.feeOptions,
    options.permit,
    options.slippageTolerance,
    provider,
    trade,
  ])
}
