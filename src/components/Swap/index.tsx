import { Trans } from '@lingui/macro'
import BrandedFooter from 'components/BrandedFooter'
import Wallet from 'components/ConnectWallet'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import { useBrandingSetting } from 'hooks/useSyncBrandingSetting'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { displayTxHashAtom } from 'state/swap'

import Dialog from '../Dialog'
import Header from '../Header'
import { BoundaryProvider } from '../Popover'
import Input from './Input'
import Output from './Output'
import ReverseButton from './ReverseButton'
import Settings from './Settings'
import { StatusDialog } from './Status'
import SwapActionButton from './SwapActionButton'
import Toolbar from './Toolbar'
import useValidate from './useValidate'

// SwapProps also currently includes props needed for wallet connection (eg hideConnectionUI),
// since the wallet connection component exists within the Swap component.
// TODO(zzmp): refactor WalletConnection into Widget component
export interface SwapProps extends FeeOptions, SwapController, SwapEventHandlers, TokenDefaults {
  hideConnectionUI?: boolean
  routerUrl?: string
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncController(props as SwapController)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncSwapEventHandlers(props as SwapEventHandlers)
  useSyncTokenDefaults(props as TokenDefaults)

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = useMemo(() => displayTxHash && pendingTxs[displayTxHash], [displayTxHash, pendingTxs])

  const disableBranding = useBrandingSetting()
  return (
    <>
      <Header title={<Trans>Swap</Trans>}>
        <Wallet disabled={props.hideConnectionUI} />
        <Settings />
      </Header>
      <div ref={setWrapper}>
        <BoundaryProvider value={wrapper}>
          <SwapInfoProvider routerUrl={props.routerUrl}>
            <Input />
            <ReverseButton />
            <Output />
            <Toolbar />
            <SwapActionButton />
            {!disableBranding && <BrandedFooter />}
          </SwapInfoProvider>
        </BoundaryProvider>
      </div>
      {displayTx && (
        <Dialog color="dialog">
          <StatusDialog tx={displayTx} onClose={() => setDisplayTxHash()} />
        </Dialog>
      )}
    </>
  )
}
