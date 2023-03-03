import { Trans } from '@lingui/macro'
import { Connector } from '@web3-react/types'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import useConnectors from 'hooks/web3/useConnectors'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { lightTheme, ThemedText } from 'theme'
import { WalletConnectQR } from 'utils/WalletConnect'

const NO_WALLET_HELP_CENTER_URL = 'https://help.uniswap.org/en/articles/5391585-how-to-get-a-wallet'

const Body = styled(Column)`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, calc(50% - 0.5rem / 2));
  grid-template-rows: 2fr 1fr;
  height: calc(100% - 2.5rem);
`

const StyledButtonContents = styled(Column)`
  gap: 0.75rem;
  justify-items: center;
`

const StyledMainButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  grid-column: 1 / 3;
  height: 100%;
  padding: 22px;
`

const StyledMainButtonRow = styled(Row)`
  grid-template-columns: repeat(2, calc(50% - 1rem / 2));
  justify-items: center;
`

const StyledSmallButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  height: 88px;
  padding: 16px;
`

const StyledNoWalletText = styled(ThemedText.Subhead1)`
  line-height: 20px;
  white-space: pre-wrap;
`

const QRCodeWrapper = styled.div`
  height: 110px;
  width: 110px;
  path {
    /* Maximize contrast: transparent in light theme, otherwise hard-coded to light theme. */
    fill: ${({ theme }) => (theme.container === lightTheme.container ? '#00000000' : lightTheme.container)};
  }
`

function ButtonContents({ walletName, logoSrc, caption }: ButtonProps) {
  return (
    <StyledButtonContents>
      <img src={logoSrc} alt={walletName} width={26} />
      <ThemedText.Subhead1>{walletName}</ThemedText.Subhead1>
      {caption && (
        <ThemedText.Caption color="secondary">
          <Trans>{caption}</Trans>
        </ThemedText.Caption>
      )}
    </StyledButtonContents>
  )
}

interface ButtonProps {
  walletName?: string
  logoSrc?: string
  caption?: string
  onClick?: () => void
}

function WalletConnectButton({
  walletName,
  logoSrc,
  walletConnectQR: walletConnect,
  onClick,
}: ButtonProps & { walletConnectQR: WalletConnectQR }) {
  const [svg, setSvg] = useState(walletConnect.svg)
  useEffect(() => {
    if (!svg) walletConnect.activate()

    walletConnect.events.on(WalletConnectQR.SVG_AVAILABLE, setSvg)
    return () => {
      walletConnect.events.off(WalletConnectQR.SVG_AVAILABLE, setSvg)
    }
  }, [svg, walletConnect])

  return (
    <StyledMainButton color="container" onClick={onClick}>
      <StyledMainButtonRow>
        <ButtonContents
          logoSrc={logoSrc}
          walletName={walletName}
          caption={'Scan to connect your wallet. Works with most wallets.'}
        />
        {svg && <QRCodeWrapper dangerouslySetInnerHTML={{ __html: svg }} />}
      </StyledMainButtonRow>
    </StyledMainButton>
  )
}

function MetaMaskButton({ walletName, logoSrc, onClick }: ButtonProps) {
  return (
    <StyledSmallButton color="container" onClick={onClick}>
      <ButtonContents logoSrc={logoSrc} walletName={walletName} />
    </StyledSmallButton>
  )
}

function NoWalletButton() {
  return (
    <StyledSmallButton color="container" onClick={() => window.open(NO_WALLET_HELP_CENTER_URL)}>
      <StyledNoWalletText>
        <Trans>{`I don't have a wallet`}</Trans>
      </StyledNoWalletText>
    </StyledSmallButton>
  )
}

export function ConnectWalletDialog() {
  const connectors = useConnectors()
  const onActivate = useCallback(async (connector: Connector) => {
    try {
      await connector.activate()
    } catch (error) {}
  }, [])

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} />
      <Body align="stretch" padded>
        <WalletConnectButton
          walletName="WalletConnect"
          logoSrc={WALLETCONNECT_ICON_URL}
          walletConnectQR={connectors.walletConnectQR}
          onClick={() => onActivate(connectors.walletConnect)}
        />
        <MetaMaskButton
          walletName="MetaMask"
          logoSrc={METAMASK_ICON_URL}
          onClick={() => onActivate(connectors.metaMask)}
        />
        <NoWalletButton />
      </Body>
    </>
  )
}
