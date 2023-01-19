import { IconButton } from 'components/Button'
import Column, { ColumnProps } from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import useScrollbar from 'hooks/useScrollbar'
import { Expando as ExpandoIcon } from 'icons'
import { PropsWithChildren, ReactNode, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { AnimationSpeed, ThemedText } from 'theme'

const HeaderColumn = styled(Column)`
  cursor: pointer;
  transition: gap ${AnimationSpeed.Medium};
`

const TitleRow = styled(Row)`
  cursor: pointer;
`

const TitleHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const bottomCss = css`
  :after {
    background: linear-gradient(transparent, ${({ theme }) => theme.dialog});
    bottom: 0;
    content: '';
    height: 0.75em;
    pointer-events: none;
    position: absolute;
    width: calc(100% - 1em);
  }
`

const ExpandoColumn = styled(Column)<{ height: number; open: boolean; showBottomGradient: boolean }>`
  height: ${({ height, open }) => (open ? height : 0)}em;
  overflow: hidden;
  position: relative;
  transition: height ${AnimationSpeed.Medium}, padding ${AnimationSpeed.Medium};
  ${({ showBottomGradient }) => showBottomGradient && bottomCss}
`

const InnerColumn = styled(Column)<{ height: number }>`
  height: ${({ height }) => height}em;
`

const IconPrefix = styled.div`
  color: ${({ theme }) => theme.primary};
`

interface ExpandoProps extends ColumnProps {
  title: ReactNode
  iconPrefix?: ReactNode
  open: boolean
  onExpand: () => void
  // The absolute height of the expanded container, in em.
  height: number
  hideRulers?: boolean
  styledTitleWrapper?: boolean
  showBottomGradient?: boolean
}

const StyledTitleWrapper = ({
  title,
  open,
  onExpand,
  hideRulers,
  iconPrefix,
}: Pick<ExpandoProps, 'title' | 'open' | 'onExpand' | 'hideRulers' | 'iconPrefix'>) => {
  return (
    <HeaderColumn onClick={onExpand} gap={open ? 0.5 : 0.75}>
      {!hideRulers && <Rule />}
      <ThemedText.Subhead2 color="secondary">
        <TitleRow gap={1}>
          <TitleHeader>{title}</TitleHeader>
          <Row gap={0.2}>
            {iconPrefix && <IconPrefix>{iconPrefix}</IconPrefix>}
            <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
          </Row>
        </TitleRow>
      </ThemedText.Subhead2>
      {!hideRulers && open && <Rule />}
    </HeaderColumn>
  )
}

/** A scrollable Expando with an absolute height. */
export default function Expando({
  title,
  iconPrefix,
  open,
  onExpand,
  height,
  children,
  hideRulers,
  styledTitleWrapper = true,
  showBottomGradient = true,
  ...rest
}: PropsWithChildren<ExpandoProps>) {
  const [scrollingEl, setScrollingEl] = useState<HTMLDivElement | null>(null)
  const scrollbar = useScrollbar(scrollingEl, { hideScrollbar: true })
  return (
    <Column {...rest}>
      {styledTitleWrapper ? (
        <StyledTitleWrapper
          iconPrefix={iconPrefix}
          hideRulers={hideRulers}
          title={title}
          open={open}
          onExpand={onExpand}
        />
      ) : (
        title
      )}
      <ExpandoColumn open={open} height={height} showBottomGradient={showBottomGradient}>
        <InnerColumn flex align="stretch" height={height} ref={setScrollingEl} css={scrollbar}>
          {children}
        </InnerColumn>
      </ExpandoColumn>
    </Column>
  )
}
