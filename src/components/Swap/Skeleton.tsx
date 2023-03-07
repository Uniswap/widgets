import WidgetWrapper from 'components/WidgetWrapper'
import { StrictMode } from 'react'
import styled from 'styled-components/macro'
import { Provider as ThemeProvider, Theme } from 'theme'

import Column from '../Column'
import Row from '../Row'
import ReverseButton from './ReverseButton'

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const Blob = styled.div<{ height: string; width: string; radius?: number; isModule?: boolean }>`
  background-color: ${({ isModule, theme }) => (isModule ? theme.outline : theme.module)};
  border-radius: ${({ radius }) => (radius ?? 0.25) + 'rem'};
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`
const WideColumn = styled(Column)`
  width: 100%;
`

const TitleColumn = styled(Column)`
  padding: 0.5rem;
  padding-bottom: 1.25rem;
  width: 100%;
`

const InputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  display: flex;
  gap: 1.875rem;
  margin-bottom: 0.25rem;
  padding: 0.75rem;
  padding-bottom: 3.25rem;
  padding-top: 3.25rem;
`

const OutputColumn = styled(InputColumn)`
  padding-bottom: 3rem;
  padding-top: 3.5rem;
`

const ButtonColumn = styled(Column)`
  padding-bottom: 0rem;
  padding-top: 0.55rem;
  width: 100%;
`

function FloatingTitle() {
  return (
    <TitleColumn gap={0.75}>
      <Row>
        <Blob height="1rem" width="2.5rem" />
      </Row>
    </TitleColumn>
  )
}

function FloatingInput() {
  return (
    <WideColumn gap={0.75}>
      <Row>
        <Blob height="2rem" width="3.75rem" isModule />
        <Blob height="2rem" width="7.25rem" isModule />
      </Row>
    </WideColumn>
  )
}

function FloatingButton() {
  return (
    <ButtonColumn>
      <Blob height="3.5rem" width="100%" radius={0.75} />
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
                <FloatingInput />
              </OutputColumn>
              <FloatingButton />
            </div>
          </LoadingWrapper>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}
