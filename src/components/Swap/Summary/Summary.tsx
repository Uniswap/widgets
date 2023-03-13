import { formatPriceImpact } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { PriceImpact } from 'hooks/usePriceImpact'
import { ArrowDown, ArrowRight } from 'icons'
import { PropsWithChildren } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

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
}

function TokenValue({ input, usdc, open, children }: PropsWithChildren<TokenValueProps>) {
  return (
    <CollapsingColumn justify="flex-start" open={open} flex>
      <Row gap={0.375} justify="flex-start">
        <TokenImg token={input.currency} />
        <ThemedText.Body2 userSelect>
          {formatCurrencyAmount({ amount: input })} {input.currency.symbol}
        </ThemedText.Body2>
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
}

export default function Summary({ input, output, inputUSDC, outputUSDC, impact, open = true }: SummaryProps) {
  const summaryContents = (
    <>
      <TokenValue input={input} usdc={inputUSDC} open={open} />
      {open ? <ArrowRight /> : <ArrowDown />}
      <TokenValue input={output} usdc={outputUSDC} open={open}>
        {impact && (
          <ThemedText.Caption color={impact.warning}>({formatPriceImpact(impact?.percent)})</ThemedText.Caption>
        )}
      </TokenValue>
    </>
  )

  if (open) {
    return <Row gap={impact ? 1 : 0.25}>{summaryContents}</Row>
  }
  return (
    <Column gap={impact ? 1 : 0.25} flex>
      {summaryContents}
    </Column>
  )
}
