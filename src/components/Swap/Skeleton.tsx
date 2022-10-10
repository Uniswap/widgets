import { StrictMode } from 'react'
import styled from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'

import Column from '../Column'
import Row from '../Row'
import Rule from '../Rule'
import { WidgetWrapper } from '../Widget'
import ReverseButton from './ReverseButton'

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`
const Blob = styled.div<{ height: string; width: string; radius?: number; isModule?: boolean }>`
  background-color: ${({ isModule, theme }) => (isModule ? theme.outline : theme.module)};
  border-radius: ${({ theme, radius }) => (radius ?? 0.25 * theme.borderRadius) + 'em'};
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`
const WideColumn = styled(Column)`
  width: 100%;
`

function FloatingDetails({ isModule }: { isModule?: boolean }) {
  return (
    <WideColumn gap={0.75}>
      <Row>
        <Blob height="1em" width="2.5em" isModule={isModule} />
      </Row>
      <Row>
        <Blob height="2em" width="3.75em" isModule={isModule} />
        <Blob height="2em" width="7.25em" isModule={isModule} />
      </Row>
    </WideColumn>
  )
}

function FloatingButton() {
  return (
    <WideColumn gap={0.875}>
      <Rule />
      <Blob height="1em" width="7.5em" isModule />
      <Blob height="3.5em" width="100%" radius={0.75} isModule />
    </WideColumn>
  )
}

export const OutputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  display: flex;
  gap: 1.875em;
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
              <ReverseButton />
              <OutputColumn>
                <FloatingDetails isModule />
                <FloatingButton />
              </OutputColumn>
            </div>
          </LoadingWrapper>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}
