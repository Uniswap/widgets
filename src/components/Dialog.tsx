import 'wicg-inert'

import { globalFontStyles } from 'css/font'
import { useOnEscapeHandler } from 'hooks/useOnEscapeHandler'
import { largeIconCss } from 'icons'
import { ArrowLeft } from 'icons'
import { createContext, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components/macro'
import { Color, Layer, Provider as ThemeProvider, ThemedText } from 'theme'
import { useUnmountingAnimation } from 'utils/animations'

import Row from './Row'

// Include inert from wicg-inert.
declare global {
  interface HTMLElement {
    inert: boolean
  }
}

export enum Animation {
  /** Used when the Dialog is closing. */
  CLOSING = 'closing',
  /**
   * Used when the Dialog is paging to another Dialog screen.
   * Paging occurs when multiple screens are sequenced in the Dialog, so that an action that closes
   * one will simultaneously open the next. Special-casing paging animations can make the user feel
   * like they are not leaving the Dialog, despite the initial screen closing.
   */
  PAGING = 'paging',
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

const OnCloseContext = createContext<(() => void) | undefined>(undefined)

const HeaderRow = styled(Row)`
  display: flex;
  height: 1.75em;
  ${largeIconCss}

  justify-content: flex-start;
  margin: 0.5em 0.75em 0.75em;
  position: relative;
`

const StyledBackButton = styled(ArrowLeft)`
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const Title = styled.div`
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
`

interface HeaderProps {
  title?: ReactElement
}

export function Header({ title }: HeaderProps) {
  const onClose = useContext(OnCloseContext)
  return (
    <HeaderRow iconSize={1.25} data-testid="dialog-header">
      <StyledBackButton onClick={onClose} />
      <Title>
        <ThemedText.Subhead1>{title}</ThemedText.Subhead1>
      </Title>
    </HeaderRow>
  )
}

export const Modal = styled.div<{ color: Color }>`
  ${globalFontStyles};

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

export default function Dialog({ color, children, onClose }: DialogProps) {
  const context = useContext(Context)
  useEffect(() => {
    context.setActive(true)
    return () => context.setActive(false)
  }, [context])

  const modal = useRef<HTMLDivElement>(null)
  useUnmountingAnimation(modal, () => {
    // Returns the context element's child count at the time of unmounting.
    // This cannot be done through state because the count is updated outside of React's lifecycle -
    // it *must* be checked at the time of unmounting in order to include the next page of Dialog.
    return (context.element?.childElementCount ?? 0) > 1 ? Animation.PAGING : Animation.CLOSING
  })

  useOnEscapeHandler(onClose)

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
