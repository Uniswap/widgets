import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { FeeOptions } from '@uniswap/v3-sdk'
import useENS from 'hooks/useENS'
import { useEvmAccountAddress, useEvmChainId, useEvmProvider } from 'hooks/useSyncWidgetSettings'
import { ReactNode, useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'

import useSendSwapTransaction from './useSendSwapTransaction'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface UseSwapCallbackReturns {
  state: SwapCallbackState
  callback?: () => Promise<TransactionResponse>
  error?: ReactNode
}
interface UseSwapCallbackArgs {
  trade: WidoTrade | undefined // trade to execute, required
  allowedSlippage: Percent // in bips
  recipientAddressOrName: string | null | undefined // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  // signatureData: SignatureData | null | undefined
  deadline: BigNumber | undefined
  feeOptions?: FeeOptions
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback({
  trade,
  allowedSlippage,
  recipientAddressOrName,
  deadline,
  feeOptions,
}: UseSwapCallbackArgs): UseSwapCallbackReturns {
  const chainId = useEvmChainId()
  const provider = useEvmProvider()
  const account = useEvmAccountAddress()

  const { callback } = useSendSwapTransaction(account, chainId, provider, trade)

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !provider || !account || !chainId || !callback) {
      return { state: SwapCallbackState.INVALID, error: <Trans>Missing dependencies</Trans> }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, error: <Trans>Invalid recipient</Trans> }
      } else {
        return { state: SwapCallbackState.LOADING }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async () => callback(),
    }
  }, [trade, provider, account, chainId, callback, recipient, recipientAddressOrName])
}
