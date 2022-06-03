import { Trans } from "@lingui/macro"
import { useCallback, useState } from "react"
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import styled from "styled-components/macro"

const Content = styled(Column)``
const Heading = styled(Column)``
const Footing = styled(Column)``
const Body = styled(Column)<{ open: boolean }>`
  height: calc(100% - 2.5em);

  ${Content}, ${Heading} {
    flex-grow: 1;
    transition: flex-grow 0.25s;
  }

  ${Footing} {
    margin-bottom: ${({ open }) => (open ? '-0.75em' : undefined)};
    max-height: ${({ open }) => (open ? 0 : '3em')};
    opacity: ${({ open }) => (open ? 0 : 1)};
    transition: max-height 0.25s, margin-bottom 0.25s, opacity 0.15s 0.1s;
    visibility: ${({ open }) => (open ? 'hidden' : undefined)};
  }
`

export function ConnectWalletDialog() {
    const [open, setOpen] = useState(false)
  
    return (
      <>
        <Header title={<Trans>Connect wallet</Trans>} ruled />
        <Body flex align="stretch" padded gap={0.75} open={open}>
          <p>Lots of wallet connection options</p>
        </Body>
      </>
    )
  }
  