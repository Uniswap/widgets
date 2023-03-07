import { IconButton } from 'components/Button'
import Column, { ColumnProps } from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import useScrollbar from 'hooks/useScrollbar'
import { Expando as ExpandoIcon } from 'icons'
import { PropsWithChildren, ReactNode, useState } from 'react'
import styled from 'styled-components/macro'
import { AnimationSpeed, ThemedText } from 'theme'

const HeaderColumn = styled(Column)`
  cursor: pointer;
  padding: 1.25rem 1.5rem;
`

const StyledWrapper = styled(Column)<{ expanded: boolean }>`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  overflow: hidden;

  @supports (overflow: clip) {
    overflow: clip;
  }
`

const TitleRow = styled(Row)`
  cursor: pointer;
`

const TitleHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const MAX_HEIGHT = 20 // rem

function getExpandoContentHeight(height: number | undefined, maxHeight: number | undefined): number {
  return Math.min(height ?? MAX_HEIGHT, maxHeight ?? MAX_HEIGHT)
}

const ExpandoColumn = styled(Column)<{
  height?: number
  maxHeight?: number
  open: boolean
}>`
  max-height: ${({ open, height, maxHeight }) => (open ? getExpandoContentHeight(height, maxHeight) : 0)}rem;
  overflow: hidden;
  position: relative;
  transition: max-height ${AnimationSpeed.Medium}, padding ${AnimationSpeed.Medium};
`

const InnerColumn = styled(Column)<{ height?: number; maxHeight?: number }>`
  max-height: ${({ height, maxHeight }) => getExpandoContentHeight(height, maxHeight)}rem;
`

export const IconPrefix = styled.div`
  color: ${({ theme }) => theme.primary};
`

interface ExpandoProps extends ColumnProps {
  title: ReactNode
  iconPrefix?: ReactNode
  open: boolean
  onExpand: () => void
  // The absolute height of the expanded container, in rem.
  // If not provided, the container will expand to fit its contents up to {maxHeight}rem.
  height?: number
  // The maximum height of the expanded container, in rem.
  // If relying on auto-sizing, this should be something close to (but still larger than)
  // the content's height. Otherwise, the animation will feel fast.
  maxHeight?: number
  styledWrapper?: boolean
}

/** A scrollable Expando with an absolute height. */
export default function Expando({
  title,
  iconPrefix,
  open,
  onExpand,
  height,
  maxHeight,
  children,
  styledWrapper = true,
  ...rest
}: PropsWithChildren<ExpandoProps>) {
  const [scrollingEl, setScrollingEl] = useState<HTMLDivElement | null>(null)
  const scrollbar = useScrollbar(scrollingEl, { hideScrollbar: true })
  return (
    <Column {...rest}>
      {styledWrapper ? (
        <StyledWrapper expanded={open}>
          <HeaderColumn onClick={onExpand}>
            <ThemedText.ButtonSmall color="secondary">
              <TitleRow gap={1}>
                <TitleHeader>{title}</TitleHeader>
                <Row gap={0.2}>
                  {iconPrefix && <IconPrefix>{iconPrefix}</IconPrefix>}
                  <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
                </Row>
              </TitleRow>
            </ThemedText.ButtonSmall>
          </HeaderColumn>
          {open && <Rule padded />}
          <ExpandoColumn open={open} height={height} maxHeight={maxHeight}>
            <InnerColumn
              flex
              align="stretch"
              height={height}
              maxHeight={maxHeight}
              ref={setScrollingEl}
              css={scrollbar}
            >
              {children}
            </InnerColumn>
          </ExpandoColumn>
        </StyledWrapper>
      ) : (
        <>
          {title}
          <ExpandoColumn open={open} height={height} maxHeight={maxHeight}>
            <InnerColumn
              flex
              align="stretch"
              height={height}
              maxHeight={maxHeight}
              ref={setScrollingEl}
              css={scrollbar}
            >
              {children}
            </InnerColumn>
          </ExpandoColumn>
        </>
      )}
    </Column>
  )
}
