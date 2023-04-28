import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { ErrorCode } from 'constants/eip1193'
import { useMemo } from 'react'
import { AccountInterface } from 'starknet'
import { WidoTrade } from 'state/routing/types'
import { isStarknetChain } from 'utils/starknet'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'
import { approve, ChainId } from 'wido'

export type ExecTxResponse = Omit<TransactionResponse, 'gasLimit' | 'confirmations' | 'nonce' | 'value'>

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction(
  account: string | null | undefined,
  chainId: number | undefined,
  provider: JsonRpcProvider | undefined,
  trade: WidoTrade | undefined,
  snAccInterface: AccountInterface | undefined
): { callback: null | (() => Promise<ExecTxResponse>) } {
  return useMemo(() => {
    if (!trade) {
      return { callback: null }
    }

    const isStarkChain = isStarknetChain(trade.fromToken.chainId)
    if (!isStarkChain && (!provider || !account || !chainId)) {
      return { callback: null }
    }
    if (isStarkChain && !snAccInterface) {
      return { callback: null }
    }

    if (isStarkChain && snAccInterface) {
      return {
        callback: async function onSwap(): Promise<ExecTxResponse> {
          const approveTx = await approve({
            chainId: trade.fromToken.chainId as ChainId,
            fromToken: trade.fromToken.wrapped.address,
            toToken: trade.fromToken.wrapped.address,
            amount: trade.inputAmount.quotient.toString(),
          })

          const { tx } = trade as Required<WidoTrade>
          return snAccInterface
            .execute([
              {
                contractAddress: approveTx.to,
                calldata: approveTx.data as any,
                entrypoint: 'approve',
              },
              {
                contractAddress: tx.to,
                calldata: tx.data as any,
                entrypoint: 'execute_order',
              },
            ])
            .then((response) => {
              if (response) {
                return {
                  hash: response.transaction_hash,
                  from: snAccInterface.address,
                  wait: () => Promise.resolve({ blockNumber: 1 } as any),
                  data: tx.data,
                  chainId: trade.fromToken.chainId,
                }
              }
              throw new Error(t`Swap failed: no response`)
            })
            .catch((error) => {
              throw new Error(t`Swap failed: ${swapErrorToUserReadableMessage(error)}`) // FIXME: this prints to console as [object Object]
            })
        },
      }
    }

    if (!provider) {
      return { callback: null }
    }

    return {
      callback: async function onSwap(): Promise<TransactionResponse> {
        const { tx } = trade as Required<WidoTrade>
        return provider
          .getSigner()
          .sendTransaction(tx)
          .then((response) => {
            return {
              ...response,
              chainId: trade.fromToken.chainId,
            }
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
  }, [account, chainId, provider, trade, snAccInterface])
}
