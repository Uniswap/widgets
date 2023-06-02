import { Trans } from '@lingui/macro'
import BrandedFooter from 'components/BrandedFooter'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import { usePendingTransactions } from 'hooks/transactions'
import { evmFetchedBalancesAtom, snFetchedBalancesAtom } from 'hooks/useCurrencyBalance'
import { useBrandedFooter } from 'hooks/useSyncFlags'
import { useWidgetTitle, WidgetSettings } from 'hooks/useSyncWidgetSettings'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
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

function usePoll(timeout: number) {
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let t: NodeJS.Timer
    function loop(x: number, delay: number) {
      t = setTimeout(() => {
        requestAnimationFrame(() => {
          setTimer(x)
          loop(x + 1, delay)
        })
      }, delay)
    }
    loop(1, timeout)
    return () => clearTimeout(t)
  }, [])

  return timer
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncController(props as SwapController)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncSwapEventHandlers(props as SwapEventHandlers)
  const timer = usePoll(30000)

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [txHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions(txHash?.chainId)
  const tx = useMemo(
    () => txHash && (pendingTxs[txHash.hash] as Transaction<SwapTransactionInfo>),
    [txHash, pendingTxs]
  )
  const [dstTxHash, setDstTxHash] = useState<string | undefined>()
  const [txCompleted, setTxCompleted] = useState<boolean>(false)

  useEffect(() => {
    if (!tx || !tx.receipt) return
    if (tx.info.trade.fromToken.chainId === tx.info.trade.toToken.chainId) return
    if (txCompleted) return
    getStatus({
      chainId: tx.info.trade.fromToken.chainId,
      txHash: tx.receipt.transactionHash,
    }).then(({ status, toTxHash }) => {
      if (status === 'success') {
        setTxCompleted(true)
      }
      setDstTxHash(toTxHash)
    })
  }, [tx, txCompleted, timer])

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
            onClose={() => {
              setDisplayTxHash()
              setDstTxHash(undefined)
              setSnFetchedBalances({})
              setEvmFetchedBalances({})
            }}
          />
        </Dialog>
      )}
    </>
  )
}
