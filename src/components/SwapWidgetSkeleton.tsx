import { StrictMode } from 'react'
import styled from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'

import { WidgetWrapper } from './Widget'

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`
const TopWrapper = styled.div`
  border-radius: 16px;
  padding: 8px 12px 8px 8px;
  width: 100%;
`
const BottomWrapper = styled.div`
  background-color: ${({ theme }) => theme.module};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 234px;
  justify-content: space-between;
  padding: 12px 12px 32px 8px;
  width: 100%;
`
const ButtonWrapper = styled.div`
  margin-left: 4px;
`
const Blob = styled.div<{ height: string; width: string; radius?: string; darker?: boolean }>`
  background-color: ${({ darker, theme }) => (darker ? theme.outline : theme.module)};
  border-radius: ${({ radius }) => radius ?? '4px'};
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`
const Column = styled.div<{ gap: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap};
  justify-content: flex-start;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;
  width: 100%;
`

function FloatingDetails({ gap, darker }: { gap: string; darker?: boolean }) {
  return (
    <Column gap={gap}>
      <Row>
        <Blob height="20px" width="40px" darker={darker} />
      </Row>
      <Row>
        <Blob height="32px" width="60px" darker={darker} />
        <Blob height="32px" width="85px" darker={darker} />
      </Row>
    </Column>
  )
}

function FloatingButton() {
  return (
    <ButtonWrapper>
      <Column gap="12px">
        <Blob height="16px" width="120px" darker />
        <Blob height="56px" width="100%" radius="12px" darker />
      </Column>
    </ButtonWrapper>
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
            <TopWrapper>
              <FloatingDetails gap="16px" />
            </TopWrapper>
            <BottomWrapper>
              <FloatingDetails gap="12px" darker />
              <FloatingButton />
            </BottomWrapper>
          </LoadingWrapper>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}
