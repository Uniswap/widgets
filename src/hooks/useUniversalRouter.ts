import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { sendTransaction } from '@uniswap/conedison/provider/index'
import { Percent } from '@uniswap/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { FeeOptions, toHex } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { TX_GAS_MARGIN } from 'constants/misc'
import { DismissableError, UserRejectedRequestError, WidgetPromise } from 'errors'
import { useCallback, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { SwapTransactionInfo, TransactionType } from 'state/transactions'
import isZero from 'utils/isZero'
import { isUserRejection } from 'utils/jsonRpcError'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

import { usePerfEventHandler } from './usePerfEventHandler'
import { PermitSignature } from './usePermitAllowance'

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

/**
 * Returns a callback to submit a transaction to the universal router.
 *
 * The callback returns the TransactionResponse if the transaction was submitted,
 * or undefined if the user rejected the transaction.
 **/
export function useUniversalRouterSwapCallback(trade: InterfaceTrade | undefined, options: SwapOptions) {
  const { account, chainId, provider } = useWeb3React()

  const swapCallback = useCallback(
    () =>
      WidgetPromise.from(
        async () => {
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
          const tx = {
            from: account,
            to: UNIVERSAL_ROUTER_ADDRESS(chainId),
            data,
            // TODO: universal-router-sdk returns a non-hexlified value.
            ...(value && !isZero(value) ? { value: toHex(value) } : {}),
          }

          const response = await sendTransaction(provider, tx, TX_GAS_MARGIN)
          if (tx.data !== response.data) {
            throw new DismissableError({
              message: t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`,
              error: 'Swap was modified in wallet.',
            })
          }

          return {
            type: TransactionType.SWAP,
            response,
            tradeType: trade.tradeType,
            trade,
            slippageTolerance: options.slippageTolerance,
          } as SwapTransactionInfo
        },
        null,
        (error) => {
          if (error instanceof DismissableError) throw error
          if (isUserRejection(error)) throw new UserRejectedRequestError()
          throw new DismissableError({ message: swapErrorToUserReadableMessage(error), error })
        }
      ),
    [account, chainId, options.deadline, options.feeOptions, options.permit, options.slippageTolerance, provider, trade]
  )

  const args = useMemo(() => trade && { trade }, [trade])
  return usePerfEventHandler('onSwapSend', args, swapCallback)
}
