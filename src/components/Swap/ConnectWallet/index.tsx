import { Trans } from "@lingui/macro"
import { useCallback, useState } from "react"
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import styled from "styled-components/macro"
import Row from "components/Row"
import Button from "components/Button"
import { ThemedText } from "theme"

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

const StyledMainButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  background-color: ${({ theme }) => theme.container};
  width: 204px;
  height: 204px;
`

const StyledNoWalletButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  background-color: ${({ theme }) => theme.container};
  width: 204px;
  height: 60px;
`

const StyledSmallButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  background-color: ${({ theme }) => theme.container};
  width: 112px;
  height: 80px;
`

interface ButtonProps {
  walletName?: string
  logoSrc?: string
  caption?: string
  onClick: () => void
}

function MainButton({ walletName, logoSrc, caption, onClick }: ButtonProps) {
  return (
    <StyledMainButton onClick={onClick}>
      <img src={logoSrc} alt={walletName} key={walletName} width={80} />
      <ThemedText.Subhead1>
        <Trans>{walletName}</Trans>
      </ThemedText.Subhead1>
    </StyledMainButton>
  )
}

function NoWalletButton() {
  return (
    <StyledNoWalletButton onClick={() => console.log("open website")}>
      <ThemedText.Subhead1>
        <Trans>I don't have a wallet</Trans>
      </ThemedText.Subhead1>
    </StyledNoWalletButton>
  )
}


function SmallButton({ walletName, logoSrc, onClick }: ButtonProps) {
  return (
    <StyledSmallButton onClick={onClick}>
      <img src={logoSrc} alt={walletName} key={walletName} width={30} />
      <ThemedText.Subhead1>
        <Trans>{walletName}</Trans>
      </ThemedText.Subhead1>
    </StyledSmallButton>
  )
}

function MainWalletConnectionOptions() {
  return (
    <Column gap={.75}>
      <MainButton walletName="WalletConnect" logoSrc="https://uniswap.org/cdn-cgi/image/width=256/images/unigrants.png" onClick={() => console.log("open website")} />
      <NoWalletButton />
    </Column>
  )
}

function SecondaryWalletConnectionOptions() {
  return (
    <Column gap={.75} justify-content="flex-start">
      <SmallButton walletName="Rainbow" logoSrc="https://uniswap.org/cdn-cgi/image/width=256/images/unigrants.png" onClick={() => console.log("open website")} />
      <SmallButton walletName="MetaMask" logoSrc="https://uniswap.org/cdn-cgi/image/width=256/images/unigrants.png" onClick={() => console.log("open website")} />
      <SmallButton walletName="Coinbase" logoSrc="https://uniswap.org/cdn-cgi/image/width=256/images/unigrants.png" onClick={() => console.log("open website")} />
    </Column>
  )
}



export function ConnectWalletDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} />
      <Body flex align="stretch" padded gap={0.75} open={open}>
        <Row>
          <MainWalletConnectionOptions />
          <SecondaryWalletConnectionOptions />
        </Row>
      </Body>
    </>
  )
}
