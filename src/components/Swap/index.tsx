import { Trans } from '@lingui/macro'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncControlledStateProps, {
  ControlledStateProps,
  getIsControlledSwapState,
} from 'hooks/swap/useSyncControlledStateProps'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useHasFocus from 'hooks/useHasFocus'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  defaultTokenSelectorDisabledAtom,
  displayTxHashAtom,
  isControlledSwapStateAtom,
  OnSwapChangeCallbacks,
  onSwapChangeCallbacksAtom,
} from 'state/swap'
import { SwapTransactionInfo, Transaction, TransactionType, WrapTransactionInfo } from 'state/transactions'

import Dialog from '../Dialog'
import Header from '../Header'
import { BoundaryProvider } from '../Popover'
import Wallet from '../Wallet'
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

export interface SwapProps extends ControlledStateProps, TokenDefaults, FeeOptions {
  routerUrl?: string
  onConnectWallet?: () => void
}

export default function Swap(props: SwapProps) {
  const [, setIsControlledSwapState] = useAtom(isControlledSwapStateAtom)
  const { isControlledAmount, isControlledToken } = getIsControlledSwapState(props)
  useEffect(() => {
    setIsControlledSwapState({ isControlledAmount, isControlledToken })
  }, [isControlledAmount, isControlledToken, setIsControlledSwapState])

  useValidate(props)
  useSyncConvenienceFee(props)
  useSyncControlledStateProps(props)
  useSyncTokenDefaults(props)

  const [defaultTokenSelectorDisabled, setDefaultTokenSelectorDisabled] = useAtom(defaultTokenSelectorDisabledAtom)
  useEffect(() => {
    if (props.defaultTokenSelectorDisabled && props.defaultTokenSelectorDisabled !== defaultTokenSelectorDisabled) {
      setDefaultTokenSelectorDisabled(props.defaultTokenSelectorDisabled)
    }
  }, [props.defaultTokenSelectorDisabled, defaultTokenSelectorDisabled, setDefaultTokenSelectorDisabled])

  const [onSwapChangeCallbacks, setOnSwapChangeCallbacks] = useAtom(onSwapChangeCallbacksAtom)
  useEffect(() => {
    if (
      props.inputTokenOnChange !== onSwapChangeCallbacks.inputTokenOnChange ||
      props.outputTokenOnChange !== onSwapChangeCallbacks.outputTokenOnChange ||
      props.amountOnChange !== onSwapChangeCallbacks.amountOnChange ||
      props.independentFieldOnChange !== onSwapChangeCallbacks.independentFieldOnChange
    ) {
      setOnSwapChangeCallbacks((old: OnSwapChangeCallbacks) => {
        old.inputTokenOnChange = props.inputTokenOnChange
        old.outputTokenOnChange = props.outputTokenOnChange
        old.amountOnChange = props.amountOnChange
        old.independentFieldOnChange = props.independentFieldOnChange
        return old
      })
    }
  }, [
    props.inputTokenOnChange,
    props.outputTokenOnChange,
    props.amountOnChange,
    props.independentFieldOnChange,
    onSwapChangeCallbacks,
    setOnSwapChangeCallbacks,
  ])

  const { active, account } = useActiveWeb3React()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = getTransactionFromMap(pendingTxs, displayTxHash)

  const onSupportedNetwork = useOnSupportedNetwork()
  const isDisabled = !(active && onSupportedNetwork)

  const focused = useHasFocus(wrapper)

  return (
    <>
      <Header title={<Trans>Swap</Trans>}>
        <Wallet disabled={!active || Boolean(account)} onClick={props.onConnectWallet} />
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
