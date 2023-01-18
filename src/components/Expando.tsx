import { IconButton } from 'components/Button'
import Column, { ColumnProps } from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import useScrollbar from 'hooks/useScrollbar'
import { Expando as ExpandoIcon } from 'icons'
import { PropsWithChildren, ReactNode, useState } from 'react'
import styled, { css } from 'styled-components/macro'

const HeaderColumn = styled(Column)`
  cursor: pointer;
  transition: gap 0.25s;
`

const TitleRow = styled(Row)`
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
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

const ExpandoColumn = styled(Column)<{ height: number; open: boolean; bottomGradient: boolean }>`
  height: ${({ height, open }) => (open ? height : 0)}em;
  overflow: hidden;
  position: relative;
  transition: height 0.25s, padding 0.25s;
  ${({ bottomGradient }) => bottomGradient && bottomCss}
`

const InnerColumn = styled(Column)<{ height: number }>`
  height: ${({ height }) => height}em;
`

interface ExpandoProps extends ColumnProps {
  title: ReactNode
  open: boolean
  onExpand: () => void
  // The absolute height of the expanded container, in em.
  height: number
  styledTitleWrapper?: boolean
  bottomGradient?: boolean
}

const StyledTitleWrapper = ({ title, open, onExpand }: Pick<ExpandoProps, 'title' | 'open' | 'onExpand'>) => {
  return (
    <HeaderColumn onClick={onExpand} gap={open ? 0.5 : 0.75}>
      <Rule />
      <TitleRow>
        <TitleHeader>{title}</TitleHeader>
        <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
      </TitleRow>
      {open && <Rule />}
    </HeaderColumn>
  )
}

/** A scrollable Expando with an absolute height. */
export default function Expando({
  title,
  open,
  onExpand,
  height,
  children,
  styledTitleWrapper = true,
  bottomGradient = true,
  ...rest
}: PropsWithChildren<ExpandoProps>) {
  const [scrollingEl, setScrollingEl] = useState<HTMLDivElement | null>(null)
  const scrollbar = useScrollbar(scrollingEl)
  return (
    <Column {...rest}>
      {styledTitleWrapper ? <StyledTitleWrapper title={title} open={open} onExpand={onExpand} /> : title}
      <ExpandoColumn open={open} height={height} bottomGradient={bottomGradient}>
        <InnerColumn flex align="stretch" height={height} ref={setScrollingEl} css={scrollbar}>
          {children}
        </InnerColumn>
      </ExpandoColumn>
    </Column>
  )
}
