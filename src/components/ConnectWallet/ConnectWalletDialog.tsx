import { Trans } from '@lingui/macro'
import { Web3ReactHooks } from '@web3-react/core'
import { URI_AVAILABLE, WalletConnect } from '@web3-react/walletconnect'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import EventEmitter from 'events'
import { connections, useConnect, Web3Connection } from 'hooks/connectWeb3/useActiveWeb3React'
import { atom, useAtom } from 'jotai'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Body = styled(Column)`
  height: calc(100% - 2.5em);
`

const SecondaryOptionsRow = styled(Row)`
  align-self: end;
  grid-template-columns: repeat(2, calc(50% - 0.75em / 2));
  height: fit-content;
`

const ButtonContents = styled(Column)`
  gap: 0.75em;
  justify-items: center;
`

const StyledMainButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 183px;
  padding: 22px;
`

const StyledMainButtonRow = styled(Row)`
  grid-template-columns: repeat(2, calc(50% - 1em / 2));
  justify-items: center;
`

const StyledSmallButton = styled(Button)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: 90px;
  padding: 16px;
`

const StyledNoWalletText = styled(ThemedText.Subhead1)`
  line-height: 20px;
  white-space: pre-wrap;
`

interface ButtonProps {
  walletName?: string
  logoSrc?: string
  caption?: string
  connection?: Web3Connection
  onClick: () => void
}

const wcQRUriAtom = atom<string | undefined>(undefined)

function WalletConnectButton({ walletName, logoSrc, caption, connection: wcTileConnection, onClick }: ButtonProps) {
  const [tileConnector] = wcTileConnection as [WalletConnect, Web3ReactHooks]
  const [error, setError] = useState(undefined)

  const [QRUri, setQRUri] = useAtom(wcQRUriAtom)
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('')

  useEffect(() => {
    if (QRUri) {
      formatQrCodeImage(QRUri)
    } else {
      tileConnector.activate().catch(setError)
    }
  }, [QRUri, tileConnector])

  useEffect(() => {
    // Log web3 errors
    if (error) {
      console.error('web3 error:', error)
    }
  }, [error])

  useEffect(() => {
    const disconnectListener = async (err: Error | null, _: any) => {
      if (err) console.warn(err)
      // Clear saved QR URI after disconnection
      setQRUri(undefined)
      tileConnector.deactivate()
    }
    tileConnector.provider?.connector.on('disconnect', disconnectListener)

    // Need both URI event listeners
    tileConnector.events.on(URI_AVAILABLE, async (uri: string) => {
      if (uri) {
        setQRUri(uri)
        await formatQrCodeImage(uri)
      }
    })

    const uriListener = async (err: Error | null, payload: any) => {
      if (err) console.warn(err)
      const uri: string = payload.params[0]
      if (uri) {
        setQRUri(uri)
        await formatQrCodeImage(uri)
      }
    }
    tileConnector.provider?.connector.on('display_uri', uriListener)

    return () => {
      tileConnector.events.off(URI_AVAILABLE)
      ;(tileConnector.provider?.connector as unknown as EventEmitter | undefined)?.off('display_uri', uriListener)
    }
  })

  async function formatQrCodeImage(uri: string) {
    let result = ''
    const dataString = await QRCode.toString(uri, { margin: 0, type: 'svg' })
    if (typeof dataString === 'string') {
      result = dataString.replace(
        '<svg',
        `<svg class="walletconnect-qrcode_tile" alt="WalletConnect" key="WalletConnect" width="100"`
      )
    }
    setQrCodeSvg(result)
  }

  return (
    <StyledMainButton onClick={onClick}>
      <StyledMainButtonRow>
        <ButtonContents>
          <img src={logoSrc} alt={walletName} key={walletName} width={32} />
          <ThemedText.Subhead1>
            <Trans>{walletName}</Trans>
          </ThemedText.Subhead1>
          <ThemedText.Caption color="secondary">
            <Trans>{caption}</Trans>
          </ThemedText.Caption>
        </ButtonContents>
        <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }}></div>
      </StyledMainButtonRow>
    </StyledMainButton>
  )
}

function MetaMaskButton({ walletName, logoSrc, onClick }: ButtonProps) {
  return (
    <StyledSmallButton onClick={onClick}>
      <ButtonContents>
        <img src={logoSrc} alt={walletName} key={walletName} width={26} />
        <ThemedText.Subhead1>
          <Trans>{walletName}</Trans>
        </ThemedText.Subhead1>
      </ButtonContents>
    </StyledSmallButton>
  )
}

function NoWalletButton() {
  const helpCenterUrl = 'https://help.uniswap.org/en/articles/5391585-how-to-get-a-wallet'
  return (
    <StyledSmallButton onClick={() => window.open(helpCenterUrl)}>
      <StyledNoWalletText>
        <Trans>I don't have a wallet</Trans>
      </StyledNoWalletText>
    </StyledSmallButton>
  )
}

export function ConnectWalletDialog() {
  const [mmConnection, wcConnectionTile, wcConnectionPopup] = connections
  // TODO(kristiehuang): what happens when I try to connect one wallet without disconnecting the other?

  return (
    <>
      <Header title={<Trans>Connect wallet</Trans>} />
      <Body align="stretch" padded>
        <Column>
          <WalletConnectButton
            walletName="WalletConnect"
            logoSrc={WALLETCONNECT_ICON_URL}
            caption="Scan to connect your wallet. Works with most wallets."
            connection={wcConnectionTile}
            onClick={useConnect(wcConnectionPopup)}
          />
          <SecondaryOptionsRow>
            <MetaMaskButton walletName="MetaMask" logoSrc={METAMASK_ICON_URL} onClick={useConnect(mmConnection)} />
            <NoWalletButton />
          </SecondaryOptionsRow>
        </Column>
      </Body>
    </>
  )
}
