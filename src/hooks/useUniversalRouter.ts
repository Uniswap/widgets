import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Percent } from '@uniswap/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { FeeOptions } from '@uniswap/v3-sdk'
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
    try {
      if (!account || !chainId || !provider || !trade) throw new Error('missing input')

      const calldata = SwapRouter.swapERC20CallParameters(trade, {
        slippageTolerance: options.slippageTolerance,
        deadlineOrPreviousBlockhash: options.deadline?.toString(),
        inputTokenPermit: options.permit,
        fee: options.feeOptions,
      })
      const tx =
        calldata.value && !isZero(calldata.value)
          ? {
              from: account,
              to: UNIVERSAL_ROUTER_ADDRESS(chainId),
              data: calldata.calldata,
              value: calldata.value,
            }
          : {
              from: account,
              to: UNIVERSAL_ROUTER_ADDRESS(chainId),
              data: calldata.calldata,
            }

      const response = await provider
        .estimateGas(tx)
        .catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error')
          return provider
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', gasError, result)
              throw new Error('unexpected issue with gas estimation; please try again')
            })
            .catch((callError) => {
              console.debug('Call threw error', callError)
              throw new Error(swapErrorToUserReadableMessage(callError))
            })
        })
        .then((gasEstimate) =>
          provider.getSigner().sendTransaction({
            ...tx,
            gasLimit: calculateGasMargin(gasEstimate),
          })
        )
        .catch((error) => {
          throw new Error(swapErrorToUserReadableMessage(error))
        })
      return response
    } catch (e: unknown) {
      throw new Error(`Trade failed: ${e instanceof Error ? e.message : e}`)
    }
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
