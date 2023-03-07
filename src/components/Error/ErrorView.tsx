import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import Column from 'components/Column'
import Expando from 'components/Expando'
import Row from 'components/Row'
import { AlertTriangle, Icon, LargeIcon, StyledXButton } from 'icons'
import { ReactNode, useState } from 'react'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'

const HeaderIcon = styled(LargeIcon)`
  flex-grow: 1;
  margin: 2rem 0;
`

interface StatusHeaderProps {
  icon: Icon
  iconColor?: Color
  iconSize?: number
  children: ReactNode
}

export function StatusHeader({ icon: Icon, iconColor, iconSize = 2.5, children }: StatusHeaderProps) {
  return (
    <>
      <Column flex style={{ flexGrow: 1 }}>
        <HeaderIcon icon={Icon} color={iconColor} size={iconSize} />
        <Column gap={0.75} flex style={{ textAlign: 'center' }}>
          {children}
        </Column>
      </Column>
    </>
  )
}

const ExpandoContent = styled(ThemedText.Code)`
  margin: 0.5rem;
`

const ErrorDialogWrapper = styled(Column)`
  background-color: ${({ theme }) => theme.container};
`

interface ErrorDialogProps {
  header?: ReactNode
  message: ReactNode
  error?: Error
  action: ReactNode
  onClick: () => void
  onDismiss: () => void
}

export default function ErrorDialog({ header, message, error, action, onClick, onDismiss }: ErrorDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <ErrorDialogWrapper flex padding="1rem 0.5rem 0.25rem" gap={0.5} align="stretch">
      <Row flex flow="row-reverse">
        <LargeIcon icon={StyledXButton} onClick={onDismiss} />
      </Row>
      <StatusHeader icon={AlertTriangle} iconColor="warning" iconSize={2.5}>
        <Column gap={0.75}>
          <ThemedText.H4>{header || <Trans>Something went wrong</Trans>}</ThemedText.H4>
          <ThemedText.Body1 color="secondary">{message}</ThemedText.Body1>
        </Column>
      </StatusHeader>
      {error ? (
        <Expando
          title={open ? <Trans>Show less</Trans> : <Trans>Show more</Trans>}
          open={open}
          onExpand={() => setOpen((open) => !open)}
          maxHeight={11.5 /* rem */}
        >
          <Column flex grow padded>
            <ExpandoContent userSelect>{error.toString()}</ExpandoContent>
          </Column>
        </Expando>
      ) : (
        <Column style={{ height: '7.5rem' }} />
      )}
      <ActionButton color="accentSoft" onClick={onClick} narrow>
        {action}
      </ActionButton>
    </ErrorDialogWrapper>
  )
}
