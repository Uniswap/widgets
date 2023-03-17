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
  border-radius: ${({ theme, radius }) => (radius ?? 0.25) + 'em'};
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`
const WideColumn = styled(Column)`
  width: 100%;
`

const TitleColumn = styled(Column)`
  padding: 0.5em;
  padding-bottom: 1.25em;
  width: 100%;
`

const InputColumn = styled(Column)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius.small}em;
  display: flex;
  gap: 1.875em;
  margin-bottom: 0.25em;
  padding: 0.75em;
  padding-bottom: 3.25em;
  padding-top: 3.25em;
`

const OutputColumn = styled(InputColumn)`
  padding-bottom: 3em;
  padding-top: 3.5em;
`

const ButtonColumn = styled(Column)`
  padding-bottom: 0em;
  padding-top: 0.55em;
  width: 100%;
`

function FloatingTitle() {
  return (
    <TitleColumn gap={0.75}>
      <Row>
        <Blob height="1em" width="2.5em" />
      </Row>
    </TitleColumn>
  )
}

function FloatingInput() {
  return (
    <WideColumn gap={0.75}>
      <Row>
        <Blob height="2em" width="3.75em" isModule />
        <Blob height="2em" width="7.25em" isModule />
      </Row>
    </WideColumn>
  )
}

function FloatingButton() {
  return (
    <ButtonColumn>
      <Blob height="3.5em" width="100%" radius={0.75} />
    </ButtonColumn>
  )
}

export interface WidoWidgetPlaceholderProps {
  theme?: Theme
  width?: string | number
}

export function WidoWidgetPlaceholder({ theme, width }: WidoWidgetPlaceholderProps) {
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
