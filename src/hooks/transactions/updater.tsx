import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { SupportedChainId } from 'constants/chains'
import useBlockNumber, { useFastForwardBlockNumber } from 'hooks/useBlockNumber'
import { useEvmProvider } from 'hooks/useSyncWidgetSettings'
import { useAtomValue } from 'jotai/utils'
import ms from 'ms.macro'
import { useCallback, useEffect } from 'react'
import { RpcProvider } from 'starknet'
import { snBlockNumberAtom } from 'state/transactions'
import { retry, RetryableError, RetryOptions } from 'utils/retry'
import { isStarknetChain } from 'utils/starknet'

interface Transaction {
  addedTime: number
  receipt?: unknown
  lastCheckedBlockNumber?: number
}

export function shouldCheck(lastBlockNumber: number, tx: Transaction): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / ms`1m`
  if (minutesPending > 60) {
    // every 10 blocks if pending longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending longer than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {
  [SupportedChainId.ARBITRUM_ONE]: { n: 10, minWait: 250, maxWait: 1000 },
  [SupportedChainId.ARBITRUM_RINKEBY]: { n: 10, minWait: 250, maxWait: 1000 },
  [SupportedChainId.OPTIMISM_GOERLI]: { n: 10, minWait: 250, maxWait: 1000 },
  [SupportedChainId.OPTIMISM]: { n: 10, minWait: 250, maxWait: 1000 },
  [SupportedChainId.STARKNET]: { n: 300, minWait: 5000, maxWait: 5000 },
  [SupportedChainId.STARKNET_GOERLI]: { n: 300, minWait: 5000, maxWait: 5000 },
}
const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 1, minWait: 0, maxWait: 0 }

interface UpdaterProps {
  pendingTransactions: { [hash: string]: Transaction }
  onCheck: (tx: { chainId: number; hash: string; blockNumber: number }) => void
  onReceipt: (tx: { chainId: number; hash: string; receipt: TransactionReceipt }) => void
  chainId?: number
  snProvider: RpcProvider
}

export default function Updater({ pendingTransactions, onCheck, onReceipt, chainId, snProvider }: UpdaterProps): null {
  const provider = useEvmProvider()
  const snBlockNumber = useAtomValue(snBlockNumberAtom)
  const evmBlockNumber = useBlockNumber()

  const lastBlockNumber = isStarknetChain(chainId) ? snBlockNumber : evmBlockNumber
  const fastForwardBlockNumber = useFastForwardBlockNumber()

  const getReceipt = useCallback(
    (hash: string) => {
      if (!chainId) throw new Error('No chainId')

      if (isStarknetChain(chainId)) {
        const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS
        return retry(
          () =>
            snProvider
              .getTransactionReceipt(hash)
              .then((receipt: any) => {
                if (!receipt || !['ACCEPTED_ON_L2', 'ACCEPTED_ON_L1', 'REJECTED'].includes(receipt.status)) {
                  throw new RetryableError()
                }
                return {
                  ...receipt,
                  blockHash: receipt.block_hash,
                  blockNumber: Number(receipt.block_number),
                  status: receipt.status,
                } as any
              })
              .catch(() => {
                throw new RetryableError()
              }),
          retryOptions
        )
      }

      if (!provider) throw new Error('No provider')
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS
      return retry(
        () =>
          provider.getTransactionReceipt(hash).then((receipt) => {
            if (receipt === null) {
              console.debug(`Retrying tranasaction receipt for ${hash}`)
              throw new RetryableError()
            }
            return receipt
          }),
        retryOptions
      )
    },
    [chainId, provider, snProvider]
  )

  useEffect(() => {
    if (!chainId || !lastBlockNumber) return

    const cancels = Object.keys(pendingTransactions)
      .filter((hash) => shouldCheck(lastBlockNumber, pendingTransactions[hash]))
      .map((hash) => {
        const { promise, cancel } = getReceipt(hash)
        promise
          .then((receipt) => {
            if (receipt) {
              fastForwardBlockNumber(receipt.blockNumber)
              onReceipt({ chainId, hash, receipt })
            } else {
              onCheck({ chainId, hash, blockNumber: lastBlockNumber })
            }
          })
          .catch((error) => {
            if (!error.isCancelledError) {
              console.warn(`Failed to get transaction receipt for ${hash}`, error)
            }
          })
        return cancel
      })

    return () => {
      cancels.forEach((cancel) => cancel())
    }
  }, [chainId, lastBlockNumber, getReceipt, fastForwardBlockNumber, onReceipt, onCheck, pendingTransactions])

  return null
}

export async function getTxReceipt(chainId: number, hash: string, snProvider: RpcProvider) {
  if (isStarknetChain(chainId)) {
    const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS
    return retry(
      () =>
        snProvider
          .getTransactionReceipt(hash)
          .then((receipt: any) => {
            if (!receipt || !['ACCEPTED_ON_L2', 'ACCEPTED_ON_L1', 'REJECTED'].includes(receipt.status)) {
              throw new RetryableError()
            }
            return {
              ...receipt,
              blockHash: receipt.block_hash,
              blockNumber: Number(receipt.block_number),
              status: receipt.status,
            } as any
          })
          .catch(() => {
            throw new RetryableError()
          }),
      retryOptions
    )
  }

  throw new Error('Not implemented.')
}
