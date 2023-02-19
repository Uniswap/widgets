import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import EtherscanLink from 'components/EtherscanLink'
import Tooltip from 'components/Tooltip'
import { getChainInfo } from 'constants/chainInfo'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ArrowDown, ArrowRight, ExternalLink as ExternalLinkIcon } from 'icons'
import { PropsWithChildren } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { ExplorerDataType } from 'utils/getExplorerLink'

import Column from '../../Column'
import Row from '../../Row'
import TokenImg from '../../TokenImg'

const CollapsingColumn = styled(Column)<{ open: boolean }>`
  justify-items: ${({ open }) => (open ? 'left' : 'center')};
`

interface TokenValueProps {
  input: CurrencyAmount<Currency>
  usdc?: CurrencyAmount<Currency>
  open: boolean
  txHash?: string
}

function TokenValue({ input, usdc, open, children, txHash }: PropsWithChildren<TokenValueProps>) {
  const chainInfo = getChainInfo(input.currency.chainId)
  return (
    <CollapsingColumn justify="flex-start" open={open} flex>
      <Row gap={0.375} justify="flex-start">
        <EtherscanLink
          type={ExplorerDataType.TRANSACTION}
          data={txHash}
          showIcon={false}
          chainIdOverride={input.currency.chainId}
        >
          <TokenImg token={input.currency} />
          <ThemedText.Body2 userSelect>
            {formatCurrencyAmount({ amount: input })} {input.currency.symbol}
          </ThemedText.Body2>
          on {chainInfo?.label}
          <Tooltip placement="top" contained icon={ExternalLinkIcon}>
            <ThemedText.Caption>View on block explorer</ThemedText.Caption>
          </Tooltip>
        </EtherscanLink>
      </Row>
      {usdc && (
        <ThemedText.Caption color="secondary" userSelect>
          <Row justify="flex-start" gap={0.25}>
            {formatCurrencyAmount({ amount: usdc, isUsdPrice: true })}
            {children}
          </Row>
        </ThemedText.Caption>
      )}
    </CollapsingColumn>
  )
}

interface SummaryProps {
  input: CurrencyAmount<Currency>
  output: CurrencyAmount<Currency>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
  open?: boolean // if expando is open
  srcTxHash?: string
  dstTxHash?: string
}

export default function Summary({ input, output, inputUSDC, outputUSDC, impact, srcTxHash, dstTxHash }: SummaryProps) {
  const open = false

  const summaryContents = (
    <>
      <TokenValue input={input} usdc={inputUSDC} open={open} txHash={srcTxHash} />
      {open ? <ArrowRight /> : <ArrowDown />}
      <TokenValue input={output} usdc={outputUSDC} open={open} txHash={dstTxHash}>
        {impact && <ThemedText.Caption color={impact.warning}>({impact.toString()})</ThemedText.Caption>}
      </TokenValue>
    </>
  )

  if (open) {
    return <Row gap={impact ? 1 : 0.25}>{summaryContents}</Row>
  }
  return (
    <Column gap={impact ? 1 : 0.5} flex>
      {summaryContents}
    </Column>
  )
}
