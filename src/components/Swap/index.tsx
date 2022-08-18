import { JsonRpcProvider } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Provider as Eip1193Provider } from '@web3-react/types'
import Wallet from 'components/ConnectWallet'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import useHasFocus from 'hooks/useHasFocus'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import useSyncEventHandlers, { EventHandlers } from 'hooks/useSyncEventHandlers'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { displayTxHashAtom } from 'state/swap'
import { SwapTransactionInfo, Transaction, TransactionType, WrapTransactionInfo } from 'state/transactions'

import Dialog from '../Dialog'
import Header from '../Header'
import { BoundaryProvider } from '../Popover'
import Input from './Input'
import Output from './Output'
import ReverseButton from './ReverseButton'
import Settings from './Settings'
import { StatusDialog } from './Status'
import SwapButton from './SwapButton'
import Toolbar from './Toolbar'
import useValidate from './useValidate'

function getTransactionFromMap(
  txs: { [hash: string]: Transaction },
  hash?: string
): Transaction<SwapTransactionInfo | WrapTransactionInfo> | undefined {
  if (hash) {
    const tx = txs[hash]
    if (tx?.info?.type === TransactionType.SWAP) {
      return tx as Transaction<SwapTransactionInfo>
    }
    if (tx?.info?.type === TransactionType.WRAP) {
      return tx as Transaction<WrapTransactionInfo>
    }
  }
  return
}

// SwapProps also currently includes props needed for wallet connection, since the wallet connection component exists within the Swap component
// TODO(kristiehuang): refactor WalletConnection outside of Swap component
export interface SwapProps extends EventHandlers, FeeOptions, TokenDefaults {
  hideConnectionUI?: boolean
  provider?: Eip1193Provider | JsonRpcProvider
  routerUrl?: string
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncEventHandlers(props as EventHandlers)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncTokenDefaults(props as TokenDefaults)

  const { isActive } = useWeb3React()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = getTransactionFromMap(pendingTxs, displayTxHash)

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
          <SwapInfoProvider disabled={isDisabled} routerUrl={props.routerUrl}>
            <Input disabled={isDisabled} focused={focused} />
            <ReverseButton disabled={isDisabled} />
            <Output disabled={isDisabled} focused={focused}>
              <Toolbar />
              <SwapButton disabled={isDisabled} />
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
