import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Button from '../Button'
import Row from '../Row'
import TokenImg from '../TokenImg'

const TokenButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
`

interface TokenBaseProps {
  value: Currency
  onClick: (value: Currency) => void
}

export default function TokenBase({ value, onClick }: TokenBaseProps) {
  return (
    <TokenButton onClick={() => onClick(value)}>
      <ThemedText.ButtonMedium>
        <Row gap={0.5}>
          <TokenImg token={value} size={1.5} />
          {value.symbol}
        </Row>
      </ThemedText.ButtonMedium>
    </TokenButton>
  )
}
