import { StrictMode } from 'react'
import styled from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'

import Column from './Column'
import Row from './Row'
import ReverseButton from './Swap/ReverseButton'
import { WidgetWrapper } from './Widget'

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`
const Blob = styled.div<{ height: string; width: string; radius?: number; darker?: boolean }>`
  background-color: ${({ darker, theme }) => (darker ? theme.outline : theme.module)};
  border-radius: ${({ theme, radius }) => (radius ?? 0.25 * theme.borderRadius) + 'em'};
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`
const WideColumn = styled(Column)`
  width: 100%;
`

function FloatingDetails({ darker }: { darker?: boolean }) {
  return (
    <WideColumn gap={0.75}>
      <Row>
        <Blob height="16px" width="40px" darker={darker} />
      </Row>
      <Row>
        <Blob height="32px" width="60px" darker={darker} />
        <Blob height="32px" width="117px" darker={darker} />
      </Row>
    </WideColumn>
  )
}

function FloatingButton() {
  return (
    <WideColumn gap={0.875}>
      <Blob height="1px" width="100%" darker />
      <Blob height="16px" width="120px" darker />
      <Blob height="56px" width="100%" radius={0.75} darker />
    </WideColumn>
  )
}

export const OutputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  display: flex;
  height: 234px;
  padding: 0.75em;
  padding-bottom: 2em;
`

export const InputColumn = styled(Column)`
  margin: 0.75em;
`

export interface SwapWidgetSkeletonProps {
  theme?: Theme
  width?: string | number
}

export function SwapWidgetSkeleton({ theme, width }: SwapWidgetSkeletonProps) {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <WidgetWrapper width={width}>
          <LoadingWrapper>
            <InputColumn>
              <FloatingDetails />
            </InputColumn>
            <div>
              <ReverseButton disabled={true} />
              <OutputColumn>
                <FloatingDetails darker />
                <FloatingButton />
              </OutputColumn>
            </div>
          </LoadingWrapper>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}
