import { Trans } from '@lingui/macro'
import { StyledXButton } from 'icons'
import { forwardRef, PropsWithChildren, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components/macro'
import { AnimationSpeed, SlideAnimationType } from 'theme'

import Dialog, { Header, Modal, Provider as DialogProvider } from './Dialog'

const slideInBottom = keyframes`
  from {
    transform: translateY(calc(100vh));
  }
`

const slideOutBottom = keyframes`
  to {
    transform: translateY(100%);
  }
`

const BottomSheetModalBackdrop = styled.div<{ className?: string }>`
  background-color: ${({ theme }) => theme.scrim};
  bottom: 0;
  left: 0;
  opacity: 1;
  position: fixed;
  right: 0;

  &.hidden {
    opacity: 0;
    transition: visibility 0s linear ${AnimationSpeed.Medium}, opacity ${AnimationSpeed.Medium};
    visibility: hidden;
  }

  top: 0;
  transition: visibility 0s linear 0s, opacity ${AnimationSpeed.Medium};
  visibility: visible;
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
`

const Wrapper = styled.div`
  border-radius: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};

  @supports (overflow: clip) {
    overflow: clip;
  }

  ${Modal} {
    animation: ${slideInBottom} ${AnimationSpeed.Medium} ease-in;
    border-bottom-left-radius: 0;

    &.${SlideAnimationType.CLOSING} {
      animation: ${slideOutBottom} ${AnimationSpeed.Medium} ease-out;
    }

    border-bottom-right-radius: 0;
    bottom: 0;
    box-shadow: ${({ theme }) => theme.deepShadow};
    height: unset;
    position: fixed;
    top: unset;

    * {
      box-sizing: border-box;
    }
  }
`

type BottomSheetModalProps = PropsWithChildren<{
  onClose: () => void
  open: boolean
  title?: string
}>

export function BottomSheetModal({ children, onClose, open, title }: BottomSheetModalProps) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null)

  return (
    <>
      <RootElement ref={setRootElement} open={open} onClose={onClose} />
      <DialogProvider value={rootElement}>
        {open && (
          <Dialog color="dialog" onClose={onClose} forceContain>
            <>
              {title && <Header title={<Trans>{title}</Trans>} closeButton={<StyledXButton />} />}
              {children}
            </>
          </Dialog>
        )}
      </DialogProvider>
    </>
  )
}

type RootElementProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
}>

const RootElement = forwardRef<HTMLDivElement, RootElementProps>(function RootWrapper(
  { children, open, onClose }: RootElementProps,
  ref
) {
  return createPortal(
    <>
      {/* TODO (WEB-2767): Support dismissing modal when clicking on backdrop */}
      <BottomSheetModalBackdrop
        className={!open ? 'hidden' : undefined}
        onClick={(e) => {
          onClose()
          e.stopPropagation()
        }}
      />
      <Wrapper data-testid="BottomSheetModal__Wrapper" ref={ref}>
        {children}
      </Wrapper>
    </>,
    document.body
  )
})
