import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../Column'
import Row from '../Row'

const Img = styled.div`
  clip-path: circle(50%);
  height: 1.5rem;
  width: 1.5rem;
`
const Symbol = styled.div`
  height: 0.75rem;
  width: 7rem;
`
const Name = styled.div`
  height: 0.5rem;
  width: 5.5rem;
`
const Balance = styled.div`
  padding: 0.375rem 0;
  width: 1.5rem;
`
const TokenRow = styled.div`
  outline: none;
  padding: 0.6875rem 0.75rem;

  ${Img}, ${Symbol}, ${Name}, ${Balance} {
    background-color: ${({ theme }) => theme.secondary};
    border-radius: 0.25rem;
  }
`

function TokenOption() {
  return (
    <TokenRow>
      <ThemedText.Body1>
        <Row>
          <Row gap={0.5}>
            <Img />
            <Column flex gap={0.125} align="flex-start" justify="flex-center">
              <ThemedText.Subhead1 style={{ display: 'flex' }}>
                <Symbol />
              </ThemedText.Subhead1>
              <ThemedText.Caption style={{ display: 'flex' }}>
                <Name />
              </ThemedText.Caption>
            </Column>
          </Row>
          <Balance />
        </Row>
      </ThemedText.Body1>
    </TokenRow>
  )
}

export default function TokenOptionsSkeleton() {
  return (
    <Column>
      <TokenOption />
      <TokenOption />
      <TokenOption />
      <TokenOption />
      <TokenOption />
    </Column>
  )
}
