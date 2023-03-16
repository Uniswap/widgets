import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import ms from 'ms.macro'
import { useCallback, useEffect, useRef } from 'react'
import { RpcProvider } from 'starknet'
import { displayTxHashAtom } from 'state/swap'
import { snBlockNumberAtom, Transaction, TransactionInfo, transactionsAtom, TransactionType } from 'state/transactions'

import useBlockNumber from '../useBlockNumber'
import Updater from './updater'

export const SN_PROVIDER = new RpcProvider({
  nodeUrl: 'https://starknet-goerli.infura.io/v3/d8bc6187de214a4c956d4c64dbde2cc7',
})

function isTransactionRecent(transaction: Transaction) {
  return Date.now() - transaction.addedTime < ms`1d`
}

export function usePendingTransactions(chainIdOverride?: number) {
  const chainId = useEvmChainId()
  const actualChainId = chainIdOverride || chainId
  const txs = useAtomValue(transactionsAtom)
  return (actualChainId ? txs[actualChainId] : null) ?? {}
}

export function useAddTransactionInfo() {
  const blockNumber = useBlockNumber()
  const updateTxs = useUpdateAtom(transactionsAtom)
  const updateSnBlockNumber = useUpdateAtom(snBlockNumberAtom)

  return useCallback(
    (info: TransactionInfo) => {
      const { hash, chainId } = info.response

      updateTxs((chainTxs) => {
        const txs = chainTxs[chainId] || {}
        txs[hash] = { addedTime: new Date().getTime(), lastCheckedBlockNumber: blockNumber, info }
        chainTxs[chainId] = txs
      })

      SN_PROVIDER.getBlockNumber().then(updateSnBlockNumber)
    },
    [blockNumber, updateTxs, updateSnBlockNumber]
  )
}

/** Returns the hash of a pending approval transaction, if it exists. */
export function usePendingApproval(token?: Token, spender?: string): string | undefined {
  const chainId = useEvmChainId()
  const txs = useAtomValue(transactionsAtom)
  if (!chainId || !token || !spender) return undefined

  const chainTxs = txs[chainId]
  if (!chainTxs) return undefined

  return Object.values(chainTxs).find(
    (tx) =>
      tx &&
      tx.receipt === undefined &&
      tx.info.type === TransactionType.APPROVAL &&
      tx.info.tokenAddress === token.address &&
      tx.info.spenderAddress === spender &&
      isTransactionRecent(tx)
  )?.info.response.hash
}

export function useIsPendingApproval(token?: Token, spender?: string): boolean {
  return Boolean(usePendingApproval(token, spender))
}

export interface TransactionEventHandlers {
  onTxSubmit?: (hash: string, tx: Transaction) => void
  onTxSuccess?: (hash: string, receipt: TransactionReceipt) => void
  onTxFail?: (hash: string, receipt: TransactionReceipt) => void
}

export function TransactionsUpdater({ onTxSubmit, onTxSuccess, onTxFail }: TransactionEventHandlers) {
  const displayTxHash = useAtomValue(displayTxHashAtom)
  const chainId = displayTxHash?.chainId
  const currentPendingTxs = usePendingTransactions(chainId)

  const updateTxs = useUpdateAtom(transactionsAtom)
  const onCheck = useCallback(
    ({ chainId, hash, blockNumber }: { chainId: number; hash: string; blockNumber: number }) => {
      updateTxs((txs) => {
        const tx = txs[chainId]?.[hash]
        if (tx) {
          tx.lastCheckedBlockNumber = tx.lastCheckedBlockNumber
            ? Math.max(tx.lastCheckedBlockNumber, blockNumber)
            : blockNumber
        }
      })
    },
    [updateTxs]
  )
  const onReceipt = useCallback(
    ({ chainId, hash, receipt }: { chainId: number; hash: string; receipt: TransactionReceipt }) => {
      updateTxs((txs) => {
        const tx = txs[chainId]?.[hash]
        if (tx) {
          tx.receipt = receipt
        }
      })
      if (receipt.status === 0) {
        onTxFail?.(hash, receipt)
      } else {
        onTxSuccess?.(hash, receipt)
      }
    },
    [updateTxs, onTxFail, onTxSuccess]
  )

  const oldPendingTxs = useRef({})
  useEffect(() => {
    const newPendingTxHashes = Object.keys(currentPendingTxs)
    const oldPendingTxHashes = new Set(Object.keys(oldPendingTxs.current))
    if (newPendingTxHashes.length !== oldPendingTxHashes.size) {
      // if added new tx
      newPendingTxHashes.forEach((txHash) => {
        if (!oldPendingTxHashes.has(txHash)) {
          onTxSubmit?.(txHash, currentPendingTxs[txHash])
        }
      })
      oldPendingTxs.current = currentPendingTxs
    }
  }, [currentPendingTxs, onTxSubmit])

  return (
    <Updater
      pendingTransactions={currentPendingTxs}
      onCheck={onCheck}
      onReceipt={onReceipt}
      chainId={chainId}
      snProvider={SN_PROVIDER}
    />
  )
}
