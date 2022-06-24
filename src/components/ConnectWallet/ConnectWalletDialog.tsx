import { Trans } from '@lingui/macro'
import { Web3ReactHooks } from '@web3-react/core'
import { URI_AVAILABLE, WalletConnect } from '@web3-react/walletconnect'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
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
  const [tileConnector, tileHooks] = wcTileConnection as [WalletConnect, Web3ReactHooks]

  const [QRUri, setQRUri] = useAtom(wcQRUriAtom)
  const [qrCodeSvg, setQrCodeImg] = useState<string>('')

  useEffect(() => {
    if (QRUri) {
      formatQrCodeImage(QRUri)
    } else {
      console.log('activates')
      tileConnector.activate()
    }
    // feel like this def gets used in lots of other places, how do other dapps handle this?

    // FIX: handle on error/just recall
    // error: if we're connected, then reload the page -- we get error  POST https://mainnet.infura.io/v3/undefined 401
    // at what point does the same QR code URI expire?
    // error: if we close the popup modal before we connect, error
    return () => {
      console.log('remove event listener')
      // ;(tileConnector.provider?.connector as unknown as EventEmitter | undefined)?.off('display_uri', handleDisplayUri)
    }
  }, [QRUri, tileConnector])

  tileConnector.provider?.connector.on('disconnect', async (err, _) => {
    if (err) console.warn(err)
    // Clear saved QR URI after disconnection
    setQRUri(undefined)
    tileConnector.deactivate()
  })

  // log URI when available
  tileConnector.events.on(URI_AVAILABLE, (uri: string) => {
    console.log(`we have uri: ${uri}`)
  })

  tileConnector.provider?.connector.on('display_uri', async (err, payload) => {
    console.log('displayuri')
    if (err) console.warn(err)
    const uri: string = payload.params[0]
    if (uri) {
      setQRUri(uri)
      await formatQrCodeImage(uri)
    }
  })

  async function formatQrCodeImage(uri: string) {
    let result = ''
    const dataString = await QRCode.toString(uri, { margin: 0, type: 'svg' })
    if (typeof dataString === 'string') {
      result = dataString.replace(
        '<svg',
        `<svg class="walletconnect-qrcode__image" alt="WalletConnect" key="WalletConnect" width="120"`
      )
    }
    setQrCodeImg(result)
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
