import { Trans } from '@lingui/macro'
import { URI_AVAILABLE, WalletConnect } from '@web3-react/walletconnect'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import EventEmitter from 'events'
import useConnectors from 'hooks/web3/useConnectors'
import { atom, useAtom } from 'jotai'
import QRCode from 'qrcode'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { lightTheme, ThemedText } from 'theme'

const NO_WALLET_HELP_CENTER_URL = 'https://help.uniswap.org/en/articles/5391585-how-to-get-a-wallet'
const onError = (error: Error) => console.error('web3 error:', error)

const Body = styled(Column)`
  height: calc(100% - 2.5em);
  padding: 0em 0.75em 0.75em;
`

const SecondaryOptionsRow = styled(Row)`
  align-self: end;
  grid-template-columns: repeat(2, calc(50% - 0.5em / 2));
  height: fit-content;
`

const StyledButtonContents = styled(Column)`
  gap: 0.75em;
  justify-items: center;
`

const StyledMainButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 200px;
  padding: 22px;
`

const StyledMainButtonRow = styled(Row)`
  grid-template-columns: repeat(2, calc(50% - 1em / 2));
  justify-items: center;
`

const StyledSmallButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
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

const wcQRUriAtom = atom<string | undefined>(undefined)

function toQrCodeSvg(qrUri: string): Promise<string> {
  return QRCode.toString(qrUri, {
    // Leave a margin to increase contrast in dark mode.
    margin: 1,
    // Use 55*2=110 for the width to prevent distortion. The generated viewbox is "0 0 55 55".
    width: 110,
    type: 'svg',
  })
}

function WalletConnectButton({
  walletName,
  logoSrc,
  walletConnect,
  onClick,
}: ButtonProps & { walletConnect: WalletConnect }) {
  const [qrUri, setQrUri] = useAtom(wcQRUriAtom)
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('')

  useEffect(() => {
    let stale = false
    if (qrUri) {
      toQrCodeSvg(qrUri).then((qrCodeSvg) => {
        if (stale) return
        setQrCodeSvg(qrCodeSvg)
      })
    } else {
      walletConnect.activate()
    }
    return () => {
      stale = true
    }
  }, [qrUri, walletConnect])

  useEffect(() => {
    const disconnectListener = async (err: Error | null, _: any) => {
      if (err) onError?.(err)
      // Clear saved QR URI after disconnection
      setQrUri(undefined)
      walletConnect.deactivate()
    }
    walletConnect.provider?.connector.on('disconnect', disconnectListener)

    // Need both URI event listeners
    walletConnect.events.on(URI_AVAILABLE, async (uri: string) => {
      if (uri) {
        setQrUri(uri)
      }
    })

    const uriListener = async (err: Error | null, payload: any) => {
      if (err) onError?.(err)
      const uri: string = payload.params[0]
      if (uri) {
        setQrUri(uri)
      }
    }
    walletConnect.provider?.connector.on('display_uri', uriListener)

    return () => {
      walletConnect.events.off(URI_AVAILABLE)
      ;(walletConnect.provider?.connector as unknown as EventEmitter | undefined)?.off('display_uri', uriListener)
    }
  })

  return (
    <StyledMainButton color="container" onClick={onClick}>
      <StyledMainButtonRow>
        <ButtonContents
          logoSrc={logoSrc}
          walletName={walletName}
          caption={'Scan to connect your wallet. Works with most wallets.'}
        />
        <QRCodeWrapper dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
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
  const onActivate = useCallback(async (connector) => {
    connector.activate()
  }, [])

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} />
      <Body align="stretch" padded>
        <Column>
          <WalletConnectButton
            walletName="WalletConnect"
            logoSrc={WALLETCONNECT_ICON_URL}
            walletConnect={connectors.walletConnectQR}
            onClick={() => onActivate(connectors.walletConnect)}
          />
          <SecondaryOptionsRow>
            <MetaMaskButton
              walletName="MetaMask"
              logoSrc={METAMASK_ICON_URL}
              onClick={() => onActivate(connectors.metaMask)}
            />
            <NoWalletButton />
          </SecondaryOptionsRow>
        </Column>
      </Body>
    </>
  )
}
