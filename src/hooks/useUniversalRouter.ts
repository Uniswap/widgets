import { BigNumber } from '@ethersproject/bignumber'
import { TransactionRequest, TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { FeeOptions, toHex } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import isZero from 'utils/isZero'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

import { PermitSignature } from './usePermitAllowance'

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

export function useUniversalRouterSwapCallback(trade: InterfaceTrade | undefined, options: SwapOptions) {
  const { account, chainId, provider } = useWeb3React()

  return useCallback(async (): Promise<TransactionResponse> => {
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

      let gasEstimate: BigNumber
      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.warn(gasError)
        throw new Error('Your swap is expected to fail')
      }
      const gasLimit = calculateGasMargin(gasEstimate)
      response = await provider.getSigner().sendTransaction({ ...tx, gasLimit })
    } catch (swapError: unknown) {
      const message = swapErrorToUserReadableMessage(swapError)
      throw new Error(message)
    }
    if (tx.data !== response.data) {
      throw new Error(
        t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
      )
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
