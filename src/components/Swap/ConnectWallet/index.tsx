import { Trans } from '@lingui/macro'
import { Buffer } from 'buffer'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import { Web3Context, Web3ContextType } from 'hooks/useActiveWeb3React'
import { connectors, useConnect, Web3Connector } from 'hooks/useConnectWallet/useProvider'
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
`

const StyledNoWalletButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 90px;
`

const StyledSmallButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 90px;
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
  const helpCenterUrl = 'https://help.uniswap.org/en/articles/5391585-how-to-get-a-wallet'
  return (
    <StyledNoWalletButton onClick={() => window.open(helpCenterUrl)}>
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

function MainWalletConnectionOptions({ connector, context }: { connector: Web3Connector; context: Web3ContextType }) {
  // WalletConnect relies on Buffer, so it must be polyfilled.
  if (!('Buffer' in window)) {
    window.Buffer = Buffer
  }
  const useWalletConnect = useConnect(connector, context)
  return <MainButton walletName="WalletConnect" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useWalletConnect} />
}

function SecondaryWalletConnectionOptions({
  connector,
  context,
}: {
  connector: Web3Connector
  context: Web3ContextType
}) {
  const useMetaMask = useConnect(connector, context)
  return (
    <Row gap={0.75} grow={true}>
      <SmallButton walletName="MetaMask" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useMetaMask} />
      <NoWalletButton />
    </Row>
  )
}

export function ConnectWalletDialog() {
  const [mmConnector, wcConnector] = connectors
  // what happens when I try to connect 2 diff wallets at once?
  return (
    <Web3Context.Consumer>
      {(context) => (
        <>
          <Header title={<Trans>Connect wallet</Trans>} />
          <Body flex align="stretch" padded open={true}>
            <Column gap={0.75} align="stretch" grow={true}>
              <MainWalletConnectionOptions connector={wcConnector} context={context} />
              <SecondaryWalletConnectionOptions connector={mmConnector} context={context} />
            </Column>
          </Body>
        </>
      )}
    </Web3Context.Consumer>
  )
}
