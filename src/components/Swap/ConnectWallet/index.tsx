import { Trans } from '@lingui/macro'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import { Web3Context, Web3ContextType } from 'hooks/useActiveWeb3React'
import { connectors, Web3Connector } from 'hooks/useConnectWallet/useProvider'
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
  const [walletConnect, _] = connector
  const useWalletConnect = useCallback(() => {
    connectors.forEach(([wallet, _]) => wallet.deactivate())
    walletConnect.activate()
  }, [walletConnect])

  return <MainButton walletName="WalletConnect" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useWalletConnect} />
}

function SecondaryWalletConnectionOptions({
  connector,
  context,
}: {
  connector: Web3Connector
  context: Web3ContextType
}) {
  const [metaMask, mmHooks] = connector
  const mmIsActive = mmHooks.useIsActive()
  const useMetaMask = useCallback(() => {
    // fixme: if user is already connected to the page, it should auto-connect.. why is isActive = false?
    console.log('trying to connect metamask')
    if (!mmIsActive) {
      console.log('mm is inactive, activating now')
      connectors.forEach(([wallet, _]) => wallet.deactivate())
      metaMask.activate()
    } else {
      console.log('metamask should be already be active')
    }
  }, [mmIsActive, metaMask])

  const accounts = mmHooks.useAccounts()
  const account = mmHooks.useAccount()
  const activating = mmHooks.useIsActivating()
  const active = mmHooks.useIsActive()
  const chainId = mmHooks.useChainId()
  const error = mmHooks.useError()
  const library = mmHooks.useProvider()

  if (mmIsActive) {
    console.log('need to set context to metamask')
    context.accounts = accounts
    context.account = account
    context.activating = activating
    context.active = active
    context.chainId = chainId
    context.error = error
    context.library = library
  } else {
    console.log('need to set context to network')
  }

  return (
    <Row gap={0.75} justify-content="flex-start">
      <SmallButton walletName="MetaMask" logoSrc={TEMP_WALLET_LOGO_URL} onClick={useMetaMask} />
      <NoWalletButton />
    </Row>
  )
}

export function ConnectWalletDialog() {
  const [mmConnector, wcConnector] = connectors

  return (
    <Web3Context.Consumer>
      {(context) => (
        <>
          <Header title={<Trans>Connect wallet</Trans>} />
          <Body flex align="stretch" padded gap={0.75} open={true}>
            <Column>
              <MainWalletConnectionOptions connector={wcConnector} />
              <SecondaryWalletConnectionOptions connector={mmConnector} context={context} />
            </Column>
          </Body>
        </>
      )}
    </Web3Context.Consumer>
  )
}
