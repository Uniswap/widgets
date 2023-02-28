import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import Column from 'components/Column'
import Expando from 'components/Expando'
import Row from 'components/Row'
import { AlertTriangle, Icon, LargeIcon, StyledXButton } from 'icons'
import { Info as InfoIcon } from 'icons'
import { ReactNode, useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { AnimationSpeed, Color, ThemedText } from 'theme'

const HeaderIcon = styled(LargeIcon)`
  flex-grow: 1;
  transition: height ${AnimationSpeed.Medium}, width ${AnimationSpeed.Medium};

  svg {
    transition: height ${AnimationSpeed.Medium}, width ${AnimationSpeed.Medium};
  }
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

const ErrorHeader = styled(Column)<{ open: boolean }>`
  transition: gap ${AnimationSpeed.Medium};

  div:last-child {
    max-height: ${({ open }) => (open ? 0 : 60 / 14)}em; // 3 * line-height
    overflow-y: hidden;
    transition: max-height ${AnimationSpeed.Medium};
  }
`

const ExpandoContent = styled(ThemedText.Code)`
  margin: 0.5em 0;
`

interface ErrorDialogProps {
  header?: ReactNode
  message: ReactNode
  error?: Error
  action: ReactNode
  onClick: () => void
}

export default function ErrorDialog({ header, message, error, action, onClick }: ErrorDialogProps) {
  const [open, setOpen] = useState(false)
  const onExpand = useCallback(() => setOpen((open) => !open), [])

  return (
    <Column flex padded gap={0.75} align="stretch" style={{ height: '100%' }}>
      <Row flex flow="row-reverse">
        <LargeIcon icon={StyledXButton} onClick={onClick} />
      </Row>
      <StatusHeader icon={AlertTriangle} iconColor="critical" iconSize={open ? 3 : 4}>
        <ErrorHeader gap={open ? 0 : 0.75} open={open}>
          <ThemedText.Subhead1>{header || <Trans>Something went wrong.</Trans>}</ThemedText.Subhead1>
          {!open && <ThemedText.Body2>{message}</ThemedText.Body2>}
        </ErrorHeader>
      </StatusHeader>
      <Column gap={open ? 0 : 0.75} style={{ transition: `gap ${AnimationSpeed.Medium}` }}>
        {error ? (
          <Expando
            title={
              <>
                <InfoIcon style={{ marginRight: '5px' }} color="secondary" />
                <Trans>Error details</Trans>
              </>
            }
            open={open}
            onExpand={onExpand}
            height={7.5}
          >
            <ExpandoContent userSelect>
              {error.name}
              {error.message ? `: ${error.message}` : ''}
            </ExpandoContent>
          </Expando>
        ) : (
          <Column style={{ height: '7.5em' }} />
        )}
        <ActionButton color="critical" onClick={onClick}>
          {action}
        </ActionButton>
      </Column>
    </Column>
  )
}
