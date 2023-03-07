import { Options, Placement } from '@popperjs/core'
import { globalFontStyles } from 'css/font'
import useInterval from 'hooks/useInterval'
import ms from 'ms.macro'
import maxSize from 'popper-max-size-modifier'
import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import styled from 'styled-components/macro'
import { AnimationSpeed, Layer } from 'theme'

const BoundaryContext = createContext<HTMLDivElement | null>(null)

/* Defines a boundary component past which a Popover should not overflow. */
export function PopoverBoundaryProvider({
  value,
  children,
}: PropsWithChildren<{ value: HTMLDivElement | null; updateTrigger?: any }>) {
  return <BoundaryContext.Provider value={value}>{children}</BoundaryContext.Provider>
}

const PopoverContainer = styled.div<{ show: boolean }>`
  ${globalFontStyles}
  background-color: ${({ theme }) => theme.dialog};
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: 0.5rem;
  opacity: ${(props) => (props.show ? 1 : 0)};
  padding: 0.75rem;
  transition: visibility ${AnimationSpeed.Medium} linear, opacity ${AnimationSpeed.Medium} linear;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  z-index: ${Layer.TOOLTIP};
`

const Reference = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 1rem;
`

const Arrow = styled.div`
  height: 8px;
  width: 8px;
  z-index: ${Layer.TOOLTIP};

  ::before {
    background: ${({ theme }) => theme.dialog};
    border: 1px solid ${({ theme }) => theme.outline};
    content: '';
    height: 8px;
    position: absolute;
    transform: rotate(45deg);
    width: 8px;
  }

  &.arrow-top {
    bottom: -4px;
    ::before {
      border-radius: 1px;
      border-left: none;
      border-top: none;
    }
  }

  &.arrow-bottom {
    top: -5px; // includes -1px from border
    ::before {
      border-bottom: none;
      border-right: none;
      border-radius: 1px;
    }
  }

  &.arrow-left {
    right: -4px;
    ::before {
      border-bottom: none;
      border-left: none;
      border-radius: 1px;
    }
  }

  &.arrow-right {
    left: -5px; // includes -1px from border
    ::before {
      border-radius: 1px;
      border-right: none;
      border-top: none;
    }
  }
`

export interface PopoverProps {
  content: React.ReactNode
  show: boolean
  children: React.ReactNode
  placement: Placement
  offset?: number
  contained?: true
  showArrow?: boolean
}

export default function Popover({
  content,
  show,
  children,
  placement,
  offset = 8,
  contained,
  showArrow = true,
}: PopoverProps) {
  const boundary = useContext(BoundaryContext)
  const reference = useRef<HTMLDivElement>(null)

  // Use callback refs to be notified when instantiated
  const popover = useRef<HTMLDivElement | null>(null)
  const [arrow, setArrow] = useState<HTMLDivElement | null>(null)

  const options = useMemo((): Options => {
    const modifiers: Options['modifiers'] = [
      { name: 'offset', options: { offset: [0, offset || 4] } },
      { name: 'arrow', options: { element: arrow, padding: 4 } },
    ]
    if (contained) {
      modifiers.push(
        { name: 'preventOverflow', options: { boundary, padding: 8 } },
        { name: 'flip', options: { boundary, padding: 8 } },
        { ...maxSize, options: { boundary, padding: 8 } },
        {
          name: 'applyMaxSize',
          enabled: true,
          phase: 'beforeWrite',
          requires: ['maxSize'],
          fn({ state }) {
            const { width } = state.modifiersData.maxSize
            // width is sometimes too small, so expand it to the clientWidth:
            const maxWidth = Math.max(width, (boundary?.clientWidth ?? 16) - 16)
            state.styles.popper = {
              ...state.styles.popper,
              maxWidth: `${maxWidth}px`,
            }
          },
        }
      )
    }
    return {
      placement,
      strategy: 'absolute',
      modifiers,
    }
  }, [offset, arrow, contained, placement, boundary])

  const { styles, attributes, update } = usePopper(reference.current, popover?.current, options)

  const updateCallback = useCallback(() => {
    update && update()
  }, [update])

  useInterval(updateCallback, show ? ms`0.1s` : null)

  const containerOnClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
  }, [])

  return (
    <>
      <Reference ref={reference}>{children}</Reference>
      {boundary &&
        createPortal(
          <PopoverContainer
            show={show}
            ref={popover}
            style={styles.popper}
            {...attributes.popper}
            onClick={containerOnClick}
            data-testid="popover-container"
          >
            {content}
            {showArrow && (
              <Arrow
                className={`arrow-${attributes.popper?.['data-popper-placement'] ?? ''}`}
                ref={setArrow}
                style={styles.arrow}
                {...attributes.arrow}
              />
            )}
          </PopoverContainer>,
          boundary
        )}
    </>
  )
}
