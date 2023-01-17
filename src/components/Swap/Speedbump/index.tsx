import { t, Trans } from '@lingui/macro'
import Button, { TextButton } from 'components/Button'
import Column from 'components/Column'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle, LargeIcon, X } from 'icons'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

const Body = styled(Column)`
  align-items: center;
  height: 100%;
  text-align: center;
  width: 100%;
`
const SpeedbumpWrapper = styled.div`
  padding: 1.5em 1.25em;
`
const SpeedbumpButtonStyle = css`
  border-radius: 1em;
  padding: 1em;
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
  onContinue: () => void
  onClose: () => void
}

export function SpeedbumpDialog({ impact, onContinue, onClose }: SpeedbumpDialogProps) {
  return (
    <SpeedbumpWrapper>
      <StyledXButton onClick={onClose} />
      <Body flex align="stretch" padded gap={0.75}>
        <LargeIcon icon={AlertTriangle} color="critical" size={4} />

        <Column>
          <ThemedText.H3>
            <Trans>Warning</Trans>
          </ThemedText.H3>
          <ThemedText.Body1>
            {t`This transaction will result in a ${impact?.toString()} price impact on the market price of this pool. Do you wish to continue? `}
          </ThemedText.Body1>
          <ContinueButton onClick={onContinue}>
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
