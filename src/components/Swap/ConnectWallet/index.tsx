import { Trans } from "@lingui/macro"
import { useCallback, useState } from "react"
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import styled from "styled-components/macro"
import Row from "components/Row"
import ActionButton from "components/ActionButton"
import Button from "components/Button"

const Content = styled(Column)``
const Heading = styled(Column)``
const Footing = styled(Column)``
const Body = styled(Column) <{ open: boolean }>`
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

const MainLargeButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  width: 204px;
  height: 204px;
  flex-grow: 1;
  transition: background-color 0.25s ease-out, border-radius 0.25s ease-out, flex-grow 0.25s ease-out;

  :disabled {
    margin: -1px;
  }
`

const MainSmallButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  width: 204px;
  height: 60px;
  flex-grow: 1;
  transition: background-color 0.25s ease-out, border-radius 0.25s ease-out, flex-grow 0.25s ease-out;

  :disabled {
    margin: -1px;
  }
`

const SmallButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  width: 112px;
  height: 80px;
  flex-grow: 1;
  transition: background-color 0.25s ease-out, border-radius 0.25s ease-out, flex-grow 0.25s ease-out;

  :disabled {
    margin: -1px;
  }
`

function MainWalletConnectionOptions() {

  return (
    <Column>
      <MainLargeButton>
        WalletConnect
      </MainLargeButton>
      <MainSmallButton onClick={() => console.log("open website")}>
        I don't have a wallet
      </MainSmallButton>
    </Column>
  )
}

function SecondaryWalletConnectionOptions() {
  return (
    <Column>
      <SmallButton>rainbow</SmallButton>
      <SmallButton>metamask</SmallButton>
      <SmallButton>coinbase</SmallButton>
    </Column>
  )
}

export function ConnectWalletDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} ruled />
      <Body flex align="stretch" padded gap={0.75} open={open}>
        <Row>
          <MainWalletConnectionOptions />
          <SecondaryWalletConnectionOptions />
        </Row>
      </Body>
    </>
  )
}
