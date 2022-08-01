import 'wicg-inert'

import { ChevronLeft } from 'icons'
import { largeIconCss } from 'icons'
import { createContext, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components/macro'
import { Color, Layer, ThemedText, ThemeProvider } from 'theme'
import { delayUnmountForAnimation } from 'utils/animations'

import { IconButton } from './Button'
import Column from './Column'
import Row from './Row'
import Rule from './Rule'

// Include inert from wicg-inert
declare global {
  interface HTMLElement {
    inert?: boolean
  }
}

const Context = createContext({
  element: null as HTMLElement | null,
  active: false,
  setActive: (active: boolean) => undefined as void,
})

interface ProviderProps {
  value: HTMLElement | null
  children: ReactNode
}

export function Provider({ value, children }: ProviderProps) {
  // If a Dialog is active, mark the main content inert
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const context = { element: value, active, setActive }
  useEffect(() => {
    if (ref.current) {
      ref.current.inert = active
    }
  }, [active])
  return (
    <div
      ref={ref}
      style={{ isolation: 'isolate' }} // creates a new stacking context, preventing the dialog from intercepting non-dialog clicks
    >
      <Context.Provider value={context}>{children}</Context.Provider>
    </div>
  )
}

const OnCloseContext = createContext<() => void>(() => void 0)

const HeaderRow = styled(Row)`
  height: 1.75em;
  margin: 0 0.75em 0.75em;
  padding-top: 0.5em;
  ${largeIconCss}
`
interface HeaderProps {
  title?: ReactElement
  ruled?: boolean
  children?: ReactNode
}

export function Header({ title, children, ruled }: HeaderProps) {
  return (
    <>
      <Column>
        <HeaderRow iconSize={1.2}>
          <Row justify="flex-start" gap={0.5}>
            <IconButton color="primary" onClick={useContext(OnCloseContext)} icon={ChevronLeft} />
            <Row gap={0.5}>{title && <ThemedText.Subhead1>{title}</ThemedText.Subhead1>}</Row>
          </Row>
          {children}
        </HeaderRow>
        {ruled && <Rule padded />}
      </Column>
    </>
  )
}

export const Modal = styled.div<{ color: Color }>`
  background-color: ${({ color, theme }) => theme[color]};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  display: flex;
  flex-direction: column;
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: ${Layer.DIALOG};
`

interface DialogProps {
  color: Color
  children: ReactNode
  onClose?: () => void
}

export default function Dialog({ color, children, onClose = () => void 0 }: DialogProps) {
  const context = useContext(Context)
  useEffect(() => {
    context.setActive(true)
    return () => context.setActive(false)
  }, [context])

  const modal = useRef<HTMLDivElement>(null)
  useEffect(() => delayUnmountForAnimation(modal), [])

  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', close, true)
    return () => document.removeEventListener('keydown', close, true)
  }, [onClose])
  return (
    context.element &&
    createPortal(
      <ThemeProvider>
        <OnCloseContext.Provider value={onClose}>
          <Modal color={color} ref={modal}>
            {children}
          </Modal>
        </OnCloseContext.Provider>
      </ThemeProvider>,
      context.element
    )
  )
}
