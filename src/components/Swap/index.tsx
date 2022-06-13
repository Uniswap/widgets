import { JsonRpcProvider } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Provider as Eip1193Provider } from '@web3-react/types'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useHasFocus from 'hooks/useHasFocus'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { displayTxHashAtom } from 'state/swap'
import { SwapTransactionInfo, Transaction, TransactionType, WrapTransactionInfo } from 'state/transactions'

import Dialog from '../Dialog'
import Header from '../Header'
import { BoundaryProvider } from '../Popover'
import Wallet from '../Wallet'
import ConnectedWalletChip from './ConnectWallet/ConnectedWalletChip'
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

// todo: refactor
// SwapProps also currently includes props needed for wallet connection, since the wallet connection component exists within the Swap component
export interface SwapProps extends TokenDefaults, FeeOptions {
  provider?: Eip1193Provider | JsonRpcProvider
  onClickConnectWallet?: () => void
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncConvenienceFee(props)
  useSyncTokenDefaults(props)

  const { active, account } = useActiveWeb3React()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = getTransactionFromMap(pendingTxs, displayTxHash)

  const onSupportedNetwork = useOnSupportedNetwork()
  const isDisabled = !(active && onSupportedNetwork)

  const focused = useHasFocus(wrapper)

  const existsProvider = Boolean(props.provider)

  return (
    <>
      <Header title={<Trans>Swap</Trans>}>
        {Boolean(account) ? (
          <ConnectedWalletChip disabled={isDisabled} account={account} />
        ) : (
          <Wallet existsProvider={existsProvider} onClickConnectWallet={props.onClickConnectWallet} />
        )}
        <Settings disabled={isDisabled} />
      </Header>
      <div ref={setWrapper}>
        <BoundaryProvider value={wrapper}>
          <SwapInfoProvider disabled={isDisabled}>
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
