import { Trans } from '@lingui/macro'
import BrandedFooter from 'components/BrandedFooter'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import { SN_PROVIDER, usePendingTransactions } from 'hooks/transactions'
import { evmFetchedBalancesAtom, snFetchedBalancesAtom } from 'hooks/useCurrencyBalance'
import useInterval from 'hooks/useInterval'
import { useBrandedFooter } from 'hooks/useSyncFlags'
import { useSnAccountAddress, WidgetSettings } from 'hooks/useSyncWidgetSettings'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useMemo, useState } from 'react'
import { displayTxHashAtom } from 'state/swap'
import { snBlockNumberAtom } from 'state/transactions'

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

const WIDO_ROUTER = '0x05a0a35f386dc7e41621afcf3de7e6a74bc88ffe1c2c7e3fef0c3fa3f5154c06'

async function getFistValidTxHash(snBlockNumber?: number, snAccount?: string) {
  if (!snBlockNumber || !snAccount) return

  let { events } = await SN_PROVIDER.getEvents({
    from_block: { block_number: snBlockNumber },
    address: WIDO_ROUTER,
    chunk_size: 1000,
  })

  events = events.filter((event) => event.data.length === 5 && event.data[2] === snAccount)

  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i]
    if (event.data.length === 5 && event.data[2] === snAccount) {
      return event.transaction_hash
    }
  }

  return
}

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

  const snAccount = useSnAccountAddress()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions(displayTxHash?.chainId)
  const displayTx = useMemo(() => displayTxHash && pendingTxs[displayTxHash.hash], [displayTxHash, pendingTxs])
  const snBlockNumber = useAtomValue(snBlockNumberAtom)

  const [dstTxHash, setDstTxHash] = useState<string | undefined>()

  useInterval(() => {
    if (dstTxHash) return
    getFistValidTxHash(snBlockNumber, snAccount).then((txHash) => {
      if (txHash) {
        setDstTxHash(txHash)
      }
    })
  }, 1000)

  const setSnFetchedBalances = useUpdateAtom(snFetchedBalancesAtom)
  const setEvmFetchedBalances = useUpdateAtom(evmFetchedBalancesAtom)

  return (
    <>
      <Header title={<Trans>Zap</Trans>}>
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
      {displayTx && (
        <Dialog color="dialog">
          <StatusDialog
            tx={displayTx}
            dstTxHash={dstTxHash}
            onClose={() => {
              setDisplayTxHash()
              setDstTxHash(undefined)
              setEvmFetchedBalances({})
              setEvmFetchedBalances({})
            }}
          />
        </Dialog>
      )}
    </>
  )
}
