import { Trans } from '@lingui/macro'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import { Web3Context, Web3ContextType } from 'hooks/connectWeb3/useActiveWeb3React'
import useConnect, { connections, Web3Connection } from 'hooks/connectWeb3/useConnect'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

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

const StyledRow = styled(Row)`
  align-self: end;
  grid-template-columns: repeat(2, calc(50% - 0.75em / 2));
  height: fit-content;
`

const StyledMainButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 183px;
`

const StyledSmallButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 90px;
  padding: 20px;
`

const StyledNoWalletButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 90px;
  padding: 20px;
`

const StyledNoWalletText = styled(ThemedText.Subhead1)`
  line-height: 20px;
  white-space: pre-wrap;
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
      <Column gap={0.75} css={'justify-items: center'}>
        <img src={logoSrc} alt={walletName} key={walletName} width={100} />
        <ThemedText.Subhead1>
          <Trans>{walletName}</Trans>
        </ThemedText.Subhead1>
      </Column>
    </StyledMainButton>
  )
}

function NoWalletButton() {
  const helpCenterUrl = 'https://help.uniswap.org/en/articles/5391585-how-to-get-a-wallet'
  return (
    <StyledNoWalletButton onClick={() => window.open(helpCenterUrl)}>
      <StyledNoWalletText>
        <Trans>I don't have a wallet</Trans>
      </StyledNoWalletText>
    </StyledNoWalletButton>
  )
}

function SmallButton({ walletName, logoSrc, onClick }: ButtonProps) {
  return (
    <StyledSmallButton onClick={onClick}>
      <Column gap={0.5} css={'justify-items: center'}>
        <img src={logoSrc} alt={walletName} key={walletName} width={26} />
        <ThemedText.Subhead1>
          <Trans>{walletName}</Trans>
        </ThemedText.Subhead1>
      </Column>
    </StyledSmallButton>
  )
}

function MainWalletConnectionOptions({
  connection,
  context,
}: {
  connection: Web3Connection
  context: Web3ContextType
}) {
  const useWalletConnect = useConnect(connection, context)
  return <MainButton walletName="WalletConnect" logoSrc={WALLETCONNECT_ICON_URL} onClick={useWalletConnect} />
}

function SecondaryWalletConnectionOptions({
  connection,
  context,
}: {
  connection: Web3Connection
  context: Web3ContextType
}) {
  const useMetaMask = useConnect(connection, context)
  return (
    <StyledRow>
      <SmallButton walletName="MetaMask" logoSrc={METAMASK_ICON_URL} onClick={useMetaMask} />
      <NoWalletButton />
    </StyledRow>
  )
}

export function ConnectWalletDialog() {
  const [mmConnection, wcConnection] = connections
  // TODO(kristiehuang): what happens when I try to connect one wallet without disconnecting the other?

  return (
    <Web3Context.Consumer>
      {(context) => (
        <>
          <Header title={<Trans>Connect wallet</Trans>} />
          <Body align="stretch" padded open={true}>
            <Column>
              <MainWalletConnectionOptions connection={wcConnection} context={context} />
              <SecondaryWalletConnectionOptions connection={mmConnection} context={context} />
            </Column>
          </Body>
        </>
      )}
    </Web3Context.Consumer>
  )
}
