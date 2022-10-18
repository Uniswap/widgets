import { IconButton } from 'components/Button'
import Column, { ColumnProps } from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import useScrollbar from 'hooks/useScrollbar'
import { Expando as ExpandoIcon } from 'icons'
import { PropsWithChildren, ReactNode, useState } from 'react'
import styled from 'styled-components/macro'

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

const ExpandoColumn = styled(Column)<{ height: number; open: boolean }>`
  height: ${({ height, open }) => (open ? height : 0)}em;
  overflow: hidden;
  position: relative;
  transition: height 0.25s, padding 0.25s;

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

const InnerColumn = styled(Column)<{ height: number }>`
  height: ${({ height }) => height}em;
  padding: 0.5em 0;
`

interface ExpandoProps extends ColumnProps {
  title: ReactNode
  open: boolean
  onExpand: () => void
  // The absolute height of the expanded container, in em.
  height: number
}

/** A scrollable Expando with an absolute height. */
export default function Expando({ title, open, onExpand, height, children, ...rest }: PropsWithChildren<ExpandoProps>) {
  const [scrollingEl, setScrollingEl] = useState<HTMLDivElement | null>(null)
  const scrollbar = useScrollbar(scrollingEl)
  return (
    <Column {...rest}>
      <HeaderColumn gap={open ? 0.5 : 0.75} onClick={onExpand}>
        <Rule />
        <TitleRow>
          <TitleHeader>{title}</TitleHeader>
          <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
        </TitleRow>
        {open && <Rule />}
      </HeaderColumn>
      <ExpandoColumn open={open} height={height}>
        <InnerColumn flex align="stretch" height={height} ref={setScrollingEl} css={scrollbar}>
          {children}
        </InnerColumn>
      </ExpandoColumn>
    </Column>
  )
}
