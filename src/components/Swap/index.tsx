import { Trans } from '@lingui/macro'
import BrandedFooter from 'components/BrandedFooter'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import { usePendingTransactions } from 'hooks/transactions'
import { getTxReceipt } from 'hooks/transactions/updater'
import { evmFetchedBalancesAtom, snFetchedBalancesAtom } from 'hooks/useCurrencyBalance'
import { useBrandedFooter } from 'hooks/useSyncFlags'
import { useWidgetTitle, WidgetSettings } from 'hooks/useSyncWidgetSettings'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { GetTransactionReceiptResponse } from 'starknet'
import { displayTxHashAtom } from 'state/swap'
import { SwapTransactionInfo, Transaction } from 'state/transactions'
import { getStatus } from 'wido'

import Dialog from '../Dialog'
import Header from '../Header'
import { PopoverBoundaryProvider } from '../Popover'
import Input from './Input'
import Output from './Output'
import ReverseButton from './ReverseButton'
import Settings from './Settings'
import { StatusDialog } from './Status'
import SwapActionButton from './SwapActionButton'
import Toolbar, { Provider as ToolbarProvider } from './Toolbar'
import useValidate from './useValidate'

// SwapProps also currently includes props needed for wallet connection (eg hideConnectionUI),
// since the wallet connection component exists within the Swap component.
// TODO(zzmp): refactor WalletConnection into Widget component
export interface SwapProps extends FeeOptions, SwapController, SwapEventHandlers, WidgetSettings {
  hideConnectionUI?: boolean
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncController(props as SwapController)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncSwapEventHandlers(props as SwapEventHandlers)

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [txHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions(txHash?.chainId)
  const tx = useMemo(
    () => txHash && (pendingTxs[txHash.hash] as Transaction<SwapTransactionInfo>),
    [txHash, pendingTxs]
  )
  const [dstTxHash, setDstTxHash] = useState<string | undefined>()
  const [dstTxReceipt, setDstTxReceipt] = useState<GetTransactionReceiptResponse | undefined>()

  useEffect(() => {
    if (!tx || !tx.receipt) return
    getStatus({ chainId: tx.info.trade.fromToken.chainId, txHash: tx.receipt.transactionHash }).then(({ toTxHash }) => {
      // if not `toTxHash` is returned, the tx is single-chain
      if (toTxHash) {
        setDstTxHash(toTxHash)

        getTxReceipt(tx.info.trade.toToken.chainId, toTxHash)
          .then(({ promise, cancel }) => promise)
          .then((receipt) => {
            setDstTxReceipt(receipt)
          })
      }
    })
  }, [tx])

  const setSnFetchedBalances = useUpdateAtom(snFetchedBalancesAtom)
  const setEvmFetchedBalances = useUpdateAtom(evmFetchedBalancesAtom)
  const title = useWidgetTitle()

  return (
    <>
      <Header title={<Trans>{title}</Trans>}>
        <Settings />
      </Header>
      <div ref={setWrapper}>
        <PopoverBoundaryProvider value={wrapper}>
          <SwapInfoProvider>
            <Input />
            <ReverseButton />
            <Output />
            <ToolbarProvider>
              <Toolbar />
              <SwapActionButton />
            </ToolbarProvider>
            {useBrandedFooter() && <BrandedFooter />}
          </SwapInfoProvider>
        </PopoverBoundaryProvider>
      </div>
      {tx && (
        <Dialog color="dialog">
          <StatusDialog
            tx={tx}
            dstTxHash={dstTxHash}
            dstTxReceipt={dstTxReceipt}
            onClose={() => {
              setDisplayTxHash()
              setDstTxHash(undefined)
              setDstTxReceipt(undefined)
              setSnFetchedBalances({})
              setEvmFetchedBalances({})
            }}
          />
        </Dialog>
      )}
    </>
  )
}
