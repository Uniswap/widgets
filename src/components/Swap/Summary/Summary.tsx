import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { PriceImpact } from 'hooks/useUSDCPriceImpact'
import { ArrowDown, ArrowRight } from 'icons'
import { PropsWithChildren } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { default as Col } from '../../Column'
import Row from '../../Row'
import TokenImg from '../../TokenImg'

const Column = styled(Col)<{ displayVertical: boolean }>`
  justify-items: ${({ displayVertical }) => (displayVertical ? 'center' : 'left')};
`

interface TokenValueProps {
  input: CurrencyAmount<Currency>
  usdc?: CurrencyAmount<Currency>
  displayVertical?: boolean
}

function TokenValue({ input, usdc, displayVertical, children }: PropsWithChildren<TokenValueProps>) {
  const { i18n } = useLingui()
  return (
    <Column justify="flex-start" displayVertical={displayVertical}>
      <Row gap={0.375} justify="flex-start">
        <TokenImg token={input.currency} />
        <ThemedText.Body2 userSelect>
          {formatCurrencyAmount(input, 6, i18n.locale)} {input.currency.symbol}
        </ThemedText.Body2>
      </Row>
      {usdc && (
        <ThemedText.Caption color="secondary" userSelect>
          <Row justify="flex-start" gap={0.25}>
            ${formatCurrencyAmount(usdc, 6, 'en', 2)}
            {children}
          </Row>
        </ThemedText.Caption>
      )}
    </Column>
  )
}

interface SummaryProps {
  input: CurrencyAmount<Currency>
  output: CurrencyAmount<Currency>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
  displayVertical?: boolean
}

export default function Summary({ input, output, inputUSDC, outputUSDC, impact, displayVertical }: SummaryProps) {
  const summaryContents = (
    <>
      <TokenValue input={input} usdc={inputUSDC} displayVertical={displayVertical} />
      {displayVertical ? <ArrowDown /> : <ArrowRight />}
      <TokenValue input={output} usdc={outputUSDC} displayVertical={displayVertical}>
        {impact && <ThemedText.Caption color={impact.warning}>({impact.toString()})</ThemedText.Caption>}
      </TokenValue>
    </>
  )

  if (displayVertical) {
    return (
      <Column displayVertical={displayVertical} gap={impact ? 1 : 0.25}>
        {summaryContents}
      </Column>
    )
  } else {
    return <Row gap={impact ? 1 : 0.25}>{summaryContents}</Row>
  }
}
