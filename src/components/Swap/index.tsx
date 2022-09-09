import { JsonRpcProvider } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Provider as Eip1193Provider } from '@web3-react/types'
import Wallet from 'components/ConnectWallet'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController, SwapSettingsController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import useHasFocus from 'hooks/useHasFocus'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import useSyncBrandingSetting, { BrandingSettings } from 'hooks/useSyncBrandingSetting'
import useSyncWidgetEventHandlers, { WidgetEventHandlers } from 'hooks/useSyncWidgetEventHandlers'
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

// SwapProps also currently includes props needed for wallet connection,
// since the wallet connection component exists within the Swap component.
// This includes useSyncWidgetEventHandlers.
// TODO(zzmp): refactor WalletConnection outside of Swap component
export interface SwapProps extends BrandingSettings, FeeOptions, SwapEventHandlers, TokenDefaults, WidgetEventHandlers {
  hideConnectionUI?: boolean
  provider?: Eip1193Provider | JsonRpcProvider
  routerUrl?: string
  settings?: SwapSettingsController
  value?: SwapController
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncController(props)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncSwapEventHandlers(props as SwapEventHandlers)
  useSyncTokenDefaults(props as TokenDefaults)
  useSyncWidgetEventHandlers(props as WidgetEventHandlers)
  useSyncBrandingSetting(props as BrandingSettings)

  const { isActive } = useWeb3React()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = useMemo(() => displayTxHash && pendingTxs[displayTxHash], [displayTxHash, pendingTxs])

  const onSupportedNetwork = useOnSupportedNetwork()
  const isDisabled = !(isActive && onSupportedNetwork)

  const focused = useHasFocus(wrapper)

  return (
    <>
      <Header title={<Trans>Swap</Trans>}>
        <Wallet disabled={props.hideConnectionUI} />
        <Settings disabled={isDisabled} />
      </Header>
      <div ref={setWrapper}>
        <BoundaryProvider value={wrapper}>
          <SwapInfoProvider routerUrl={props.routerUrl}>
            <Input disabled={isDisabled} focused={focused} />
            <ReverseButton disabled={isDisabled} />
            <Output disabled={isDisabled} focused={focused}>
              <Toolbar />
              <SwapActionButton disabled={isDisabled} />
            </Output>
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
