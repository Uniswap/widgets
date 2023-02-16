import 'wicg-inert'

import { globalFontStyles } from 'css/font'
import { useOnEscapeHandler } from 'hooks/useOnEscapeHandler'
import { largeIconCss, X } from 'icons'
import { ArrowLeft } from 'icons'
import ms from 'ms.macro'
import { createContext, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components/macro'
import { AnimationSpeed, Color, Layer, Provider as ThemeProvider, ThemedText, TransitionDuration } from 'theme'
import { useUnmountingAnimation } from 'utils/animations'

import { PopoverBoundaryProvider } from './Popover'
import Row from './Row'

// Include inert from wicg-inert.
declare global {
  interface HTMLElement {
    inert: boolean
  }
}

export interface DialogOptions {
  animationType?: DialogAnimationType
}

export interface DialogWidgetProps {
  dialog?: HTMLDivElement | null
  dialogOptions?: DialogOptions
}

export enum DialogAnimationType {
  SLIDE = 'slide', // default
  FADE = 'fade',
  NONE = 'none',
}

export enum SlideAnimationType {
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
  options: {} as DialogOptions | undefined,
  active: false,
  setActive: (active: boolean) => undefined as void,
})

interface ProviderProps {
  value: HTMLElement | null
  children: ReactNode
  options?: DialogOptions
}

export function Provider({ value, children, options }: ProviderProps) {
  // If a Dialog is active, mark the main content inert
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const context = { element: value, active, setActive, options }
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
export function useCloseDialog() {
  return useContext(OnCloseContext)
}

export function useDialogAnimationType() {
  const { options } = useContext(Context)
  return options?.animationType
}

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

const StyledXButton = styled(X)`
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
  closeButton?: ReactElement
}

export function Header({ title, closeButton }: HeaderProps) {
  const onClose = useCloseDialog()
  const animationType = useDialogAnimationType()
  return (
    <HeaderRow iconSize={1.25} data-testid="dialog-header">
      {closeButton ? (
        <div onClick={onClose}>{closeButton}</div>
      ) : animationType === DialogAnimationType.SLIDE ? (
        <StyledBackButton onClick={onClose} />
      ) : (
        <StyledXButton onClick={onClose} />
      )}
      <Title>
        <ThemedText.Subhead1>{title}</ThemedText.Subhead1>
      </Title>
    </HeaderRow>
  )
}

export const Modal = styled.div<{ color: Color }>`
  ${globalFontStyles};

  background-color: ${({ color, theme }) => theme[color]};
  border-radius: ${({ theme }) => theme.borderRadius.large}rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  left: 0;
  outline: ${({ theme }) => `1px solid ${theme.outline}`};
  padding: 0.5em;
  position: absolute;
  right: 0;
  top: 0;
  z-index: ${Layer.DIALOG};
`

const slideInLeft = keyframes`
  from {
    transform: translateX(calc(100% - 0.25em));
  }
`
const slideOutLeft = keyframes`
  to {
    transform: translateX(calc(0.25em - 100%));
  }
`
const slideOutRight = keyframes`
  to {
    transform: translateX(calc(100% - 0.25em));
  }
`

const fadeIn = keyframes`
  from {
    transform: translateY(40px) scale(0.9);
  }
`

const fadeOut = keyframes`
  to {
    transform: translateY(40px) scale(0.9);
  }
`

const HiddenWrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.medium}em;
  height: 100%;
  left: 0;
  overflow: hidden;
  padding: 0.5em;
  position: absolute;
  top: 0;
  width: 100%;

  @supports (overflow: clip) {
    overflow: clip;
  }
`

const slideAnimationCss = css`
  animation: ${slideInLeft} ${AnimationSpeed.Medium} ease-in;

  &.${SlideAnimationType.PAGING} {
    animation: ${slideOutLeft} ${AnimationSpeed.Medium} ease-in;
  }
  &.${SlideAnimationType.CLOSING} {
    animation: ${slideOutRight} ${AnimationSpeed.Medium} ease-out;
  }
`

const fadeAnimationCss = css`
  animation: ${fadeIn} ${AnimationSpeed.Fast} ease-in-out;
  &.${SlideAnimationType.CLOSING} {
    animation: ${fadeOut} ${AnimationSpeed.Fast} ease-in-out;
  }
`

const EMPTY_CSS = css``

const getAnimation = (animationType?: DialogAnimationType) => {
  switch (animationType) {
    case DialogAnimationType.NONE:
      return EMPTY_CSS
    case DialogAnimationType.FADE:
      return fadeAnimationCss
    case DialogAnimationType.SLIDE:
    default:
      return slideAnimationCss
  }
}

const AnimationWrapper = styled.div<{ animationType?: DialogAnimationType }>`
  ${Modal} {
    ${({ animationType }) => getAnimation(animationType)}
  }
`

// Accounts for any animation lag
const PopoverAnimationUpdateDelay = ms`100`

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

  const popoverRef = useRef<HTMLDivElement>(null)
  const [updatePopover, setUpdatePopover] = useState(false)
  useEffect(() => {
    // Allows slide in animation to occur without popovers appearing at pre-animated location.
    setTimeout(() => {
      setUpdatePopover(true)
    }, TransitionDuration.Medium + PopoverAnimationUpdateDelay)
  }, [])

  const modal = useRef<HTMLDivElement>(null)
  useUnmountingAnimation(
    popoverRef,
    () => {
      // Returns the context element's child count at the time of unmounting.
      // This cannot be done through state because the count is updated outside of React's lifecycle -
      // it *must* be checked at the time of unmounting in order to include the next page of Dialog.
      return (context.element?.childElementCount ?? 0) > 1 ? SlideAnimationType.PAGING : SlideAnimationType.CLOSING
    },
    modal
  )

  useOnEscapeHandler(onClose)

  return (
    context.element &&
    createPortal(
      <ThemeProvider>
        <PopoverBoundaryProvider value={popoverRef.current} updateTrigger={updatePopover}>
          <div ref={popoverRef}>
            <HiddenWrapper>
              <AnimationWrapper animationType={context.options?.animationType}>
                <OnCloseContext.Provider value={onClose}>
                  <Modal color={color} ref={modal}>
                    {children}
                  </Modal>
                </OnCloseContext.Provider>
              </AnimationWrapper>
            </HiddenWrapper>
          </div>
        </PopoverBoundaryProvider>
      </ThemeProvider>,
      context.element
    )
  )
}
