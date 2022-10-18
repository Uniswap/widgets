import { Trans } from '@lingui/macro'
import ErrorDialog, { StatusHeader } from 'components/Error/ErrorDialog'
import EtherscanLink from 'components/EtherscanLink'
import Rule from 'components/Rule'
import SwapSummary from 'components/Swap/Summary'
import useInterval from 'hooks/useInterval'
import { CheckCircle, Clock, Spinner } from 'icons'
import ms from 'ms.macro'
import { useCallback, useMemo, useState } from 'react'
import { Transaction, TransactionType } from 'state/transactions'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

import ActionButton from '../../ActionButton'
import Column from '../../Column'
import Row from '../../Row'

const TransactionRow = styled(Row)`
  flex-direction: row-reverse;
`

function ElapsedTime({ tx }: { tx: Transaction }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useInterval(() => setElapsedMs(Date.now() - tx.addedTime), tx.receipt ? null : ms`1s`)

  const toElapsedTime = useCallback((ms: number) => {
    let sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    sec = sec % 60
    if (min) {
      return (
        <Trans>
          {min}m {sec}s
        </Trans>
      )
    } else {
      return <Trans>{sec}s</Trans>
    }
  }, [])
  return (
    <Row gap={0.5}>
      <Clock />
      <ThemedText.Body2>{toElapsedTime(elapsedMs)}</ThemedText.Body2>
    </Row>
  )
}

interface TransactionStatusProps {
  tx: Transaction
  onClose: () => void
}

function TransactionStatus({ tx, onClose }: TransactionStatusProps) {
  const Icon = useMemo(() => {
    return tx.receipt?.status ? CheckCircle : Spinner
  }, [tx.receipt?.status])
  const heading = useMemo(() => {
    if (tx.info.type === TransactionType.SWAP) {
      return tx.receipt?.status ? <Trans>Swap confirmed</Trans> : <Trans>Swap pending</Trans>
    } else if (tx.info.type === TransactionType.WRAP) {
      return tx.receipt?.status ? <Trans>Unwrap confirmed</Trans> : <Trans>Unwrap pending</Trans>
    } else if (tx.info.type === TransactionType.UNWRAP) {
      return tx.receipt?.status ? <Trans>Unwrap confirmed</Trans> : <Trans>Unwrap pending</Trans>
    }
    return tx.receipt?.status ? <Trans>Transaction confirmed</Trans> : <Trans>Transaction pending</Trans>
  }, [tx.info, tx.receipt?.status])

  return (
    <Column flex padded gap={0.75} align="stretch" style={{ height: '100%' }}>
      <StatusHeader icon={Icon} iconColor={tx.receipt?.status ? 'success' : undefined}>
        <ThemedText.Subhead1>{heading}</ThemedText.Subhead1>
        {tx.info.type === TransactionType.SWAP ? (
          <SwapSummary input={tx.info.trade.inputAmount} output={tx.info.trade.outputAmount} />
        ) : null}
      </StatusHeader>
      <Rule />
      <TransactionRow flex>
        <ThemedText.ButtonSmall>
          <EtherscanLink type={ExplorerDataType.TRANSACTION} data={tx.info.response.hash}>
            <Trans>View on Etherscan</Trans>
          </EtherscanLink>
        </ThemedText.ButtonSmall>
        <ElapsedTime tx={tx} />
      </TransactionRow>
      <ActionButton onClick={onClose}>
        <Trans>Close</Trans>
      </ActionButton>
    </Column>
  )
}

export default function TransactionStatusDialog({ tx, onClose }: TransactionStatusProps) {
  return tx.receipt?.status === 0 ? (
    <ErrorDialog
      header={
        <Trans>
          Try increasing your slippage tolerance.
          <br />
          NOTE: Fee on transfer and rebase tokens are incompatible with Uniswap V3.
        </Trans>
      }
      error={new Error('TODO(zzmp)')}
      action={<Trans>Dismiss</Trans>}
      onClick={onClose}
    />
  ) : (
    <TransactionStatus tx={tx} onClose={onClose} />
  )
}
