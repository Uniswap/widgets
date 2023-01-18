import { Trans } from '@lingui/macro'
import Button, { TextButton } from 'components/Button'
import Column from 'components/Column'
import { OnCloseDialogContext } from 'components/Dialog'
import Row from 'components/Row'
import { PriceImpact } from 'hooks/usePriceImpact'
import { LargeAlert, LargeIcon, X } from 'icons'
import { PropsWithChildren, useContext } from 'react'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

const SpeedbumpWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1em;
  text-align: center;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`

const BodyText = styled(ThemedText.Body1)`
  padding: 0 0.5em;
`

const IconWrapper = styled.div`
  padding: 2em;
`
const SpeedbumpButtonStyle = css`
  border-radius: 1em;
  padding: 1em;
`
const HeaderRow = styled(Row)`
  align-items: flex-start;
  width: 100%;
`

const StyledXButton = styled(LargeIcon).attrs({ icon: X, color: 'primary', size: 1.5 })`
  :hover {
    cursor: pointer;
  }
`
const ContinueButton = styled(Button)`
  ${SpeedbumpButtonStyle}
  background-color: ${({ theme }) => theme.criticalSoft};
  color: ${({ theme }) => theme.critical};
`
const CancelButton = styled(TextButton)`
  ${SpeedbumpButtonStyle}
  color: ${({ theme }) => theme.secondary};
`

interface SpeedbumpDialogProps {
  impact: PriceImpact
  onAcknowledge: () => void
}

export function SpeedbumpDialog({ impact, onAcknowledge, children }: PropsWithChildren<SpeedbumpDialogProps>) {
  const onClose = useContext(OnCloseDialogContext)
  return (
    <SpeedbumpWrapper>
      <Body>
        <Column flex gap={0.75}>
          <HeaderRow>
            <StyledXButton onClick={onClose} />
          </HeaderRow>
          <IconWrapper>
            <LargeAlert />
          </IconWrapper>

          <ThemedText.H3>
            <Trans>Warning</Trans>
          </ThemedText.H3>

          <BodyText>{children}</BodyText>
        </Column>
        <Column>
          <ContinueButton onClick={onAcknowledge}>
            <ThemedText.ButtonLarge>
              <Trans>Continue</Trans>
            </ThemedText.ButtonLarge>
          </ContinueButton>
          <CancelButton onClick={onClose}>
            <ThemedText.ButtonMedium>
              <Trans>Cancel</Trans>
            </ThemedText.ButtonMedium>
          </CancelButton>
        </Column>
      </Body>
    </SpeedbumpWrapper>
  )
}
