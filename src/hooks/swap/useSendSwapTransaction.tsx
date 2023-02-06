import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { ErrorCode } from 'constants/eip1193'
import { useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction(
  account: string | null | undefined,
  chainId: number | undefined,
  provider: JsonRpcProvider | undefined,
  trade: WidoTrade | undefined
): { callback: null | (() => Promise<TransactionResponse>) } {
  return useMemo(() => {
    if (!trade || !provider || !account || !chainId) {
      return { callback: null }
    }
    return {
      callback: async function onSwap(): Promise<TransactionResponse> {
        const { tx } = trade as Required<WidoTrade>
        return provider
          .getSigner()
          .sendTransaction(tx)
          .then((response) => {
            return response
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === ErrorCode.USER_REJECTED_REQUEST) {
              throw new Error(t`Transaction rejected.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, trade.tx)
              throw new Error(t`Swap failed: ${swapErrorToUserReadableMessage(error)}`) // FIXME: this prints to console as [object Object]
            }
          })
      },
    }
  }, [account, chainId, provider, trade])
}
