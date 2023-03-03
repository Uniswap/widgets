import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { FeeOptions } from '@uniswap/v3-sdk'
import { useEvmAccountAddress, useEvmChainId, useEvmProvider, useSnAccountInterface } from 'hooks/useSyncWidgetSettings'
import { ReactNode, useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'

import useSendSwapTransaction, { ExecTxResponse } from './useSendSwapTransaction'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface UseSwapCallbackReturns {
  state: SwapCallbackState
  callback?: () => Promise<ExecTxResponse>
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
  const snAccInterface = useSnAccountInterface()

  const { callback } = useSendSwapTransaction(account, chainId, provider, trade, snAccInterface)

  return useMemo(() => {
    if (!trade || !callback) {
      return { state: SwapCallbackState.INVALID, error: <Trans>Missing dependencies</Trans> }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async () => callback(),
    }
  }, [trade, callback])
}
