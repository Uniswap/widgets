import { StrictMode } from 'react'
import styled from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'

import Column from '../Column'
import Row from '../Row'
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

const TitleColumn = styled(Column)`
  padding: 0.5em;
  padding-bottom: 1em;
  width: 100%;
`

const InputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  display: flex;
  gap: 1.875em;
  margin-bottom: 0.25em;
  padding: 0.75em;
  padding-bottom: 3.25em;
  padding-top: 1.25em;
`

const OutputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  display: flex;
`

const OutputInnerTopColumn = styled(Column)`
  border-bottom: 1px solid ${({ theme }) => theme.container};
  padding-bottom: 2.75em;
  padding-left: 0.75em;
  padding-right: 0.75em;
  padding-top: 1.5em;
  width: 100%;
`

const OutputInnerBottomColumn = styled(Column)`
  padding-bottom: 1em;
  padding-left: 0.75em;
  padding-right: 0.75em;
  padding-top: 0.75em;
  width: 100%;
`

const ButtonColumn = styled(Column)`
  padding-bottom: 0em;
  padding-top: 0.75em;
  width: 100%;
`

function FloatingTitle() {
  return (
    <TitleColumn gap={0.75}>
      <Row>
        <Blob height="1em" width="2.5em" isModule={false} />
      </Row>
    </TitleColumn>
  )
}

function FloatingInput() {
  return (
    <WideColumn gap={0.75}>
      <Row>
        <Blob height="2em" width="3.75em" isModule={true} />
        <Blob height="2em" width="7.25em" isModule={true} />
      </Row>
    </WideColumn>
  )
}

function FloatingOutput({ isModule }: { isModule?: boolean }) {
  return (
    <>
      <OutputInnerTopColumn>
        <Row>
          <Blob height="2em" width="3.75em" isModule={isModule} />
          <Blob height="2em" width="7.25em" isModule={isModule} />
        </Row>
      </OutputInnerTopColumn>
      <OutputInnerBottomColumn>
        <Blob height="1em" width="7.5em" isModule />
      </OutputInnerBottomColumn>
    </>
  )
}

function FloatingButton() {
  return (
    <ButtonColumn gap={0.875}>
      <Blob height="3.375em" width="100%" radius={0.75} isModule />
    </ButtonColumn>
  )
}

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
            <FloatingTitle />
            <InputColumn>
              <FloatingInput />
            </InputColumn>
            <div>
              <ReverseButton />
              <OutputColumn>
                <FloatingOutput isModule />
              </OutputColumn>
              <FloatingButton />
            </div>
          </LoadingWrapper>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}
