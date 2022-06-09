import { Trans } from '@lingui/macro'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import { getConnectors, Web3Connector } from 'hooks/useConnectWallet/useProvider'
import { useCallback } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const TEMP_WALLET_LOGO_URL = 'https://uniswap.org/cdn-cgi/image/width=256/images/unigrants.png'

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

const StyledMainButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 204px;
  width: 204px;
`

const StyledNoWalletButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 60px;
  width: 204px;
`

const StyledSmallButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 80px;
  width: 112px;
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
    <StyledNoWalletButton onClick={() => console.log('open website')}>
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

function MainWalletConnectionOptions({ connector }: { connector: Web3Connector }) {
  const [walletConnect, wcHooks] = connector
  const connectors = getConnectors()
  const isActive = wcHooks.useIsActive()
  const useWalletConnect = useCallback(() => {
    connectors.forEach(([wallet, _]) => wallet.deactivate())
    walletConnect.activate()
  }, [walletConnect, isActive])

  return <MainButton walletName="WalletConnect" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useWalletConnect} />
}

function SecondaryWalletConnectionOptions({ connector }: { connector: Web3Connector }) {
  const [metaMask, mmHooks] = connector
  const connectors = getConnectors()
  const isActive = mmHooks.useIsActive()
  const useMetaMask = useCallback(() => {
    console.log('trying to connect metamask')
    if (!isActive) {
      console.log('mm is inactive, activating now')
      connectors.forEach(([wallet, _]) => wallet.deactivate())
      metaMask.activate()
    } else {
      console.log('metamask should be already be active')
    }
  }, [metaMask, isActive])

  return (
    <Row gap={0.75} justify-content="flex-start">
      <SmallButton walletName="MetaMask" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useMetaMask} />
      <NoWalletButton />
    </Row>
  )
}

export function ConnectWalletDialog() {
  const [mmConnector, wcConnector] = getConnectors()

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} />
      <Body flex align="stretch" padded gap={0.75} open={open}>
        <Column>
          <MainWalletConnectionOptions connector={wcConnector} />
          <SecondaryWalletConnectionOptions connector={mmConnector} />
        </Column>
      </Body>
    </>
  )
}
