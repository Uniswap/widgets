import { Trans } from '@lingui/macro'
import Button, { TextButton } from 'components/Button'
import Column from 'components/Column'
import { useCloseDialog } from 'components/Dialog'
import Row from 'components/Row'
import { LargeAlert, LargeIcon, X } from 'icons'
import { PropsWithChildren } from 'react'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

const SpeedBumpWrapper = styled(Column)`
  align-items: stretch;
  display: flex;
  height: 100%;
  justify-content: space-between;
  max-width: 420px;
  padding: 1rem;
  text-align: center;
`
const BodyText = styled(ThemedText.Body1)`
  padding: 0 0.5rem;
`

const IconWrapper = styled.div`
  padding: 2rem;
`
const SpeedbumpButtonStyle = css`
  border-radius: 1rem;
  padding: 1rem;
`
const HeaderRow = styled(Row)`
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
  onAcknowledge: () => void
}

export default function SpeedBumpDialog({ onAcknowledge, children }: PropsWithChildren<SpeedbumpDialogProps>) {
  const onClose = useCloseDialog()
  return (
    <SpeedBumpWrapper>
      <Column flex gap={0.75}>
        <HeaderRow flex align="center" justify="flex-end">
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
    </SpeedBumpWrapper>
  )
}
