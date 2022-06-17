import { Trans } from '@lingui/macro'
import { Web3ReactHooks } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'
import METAMASK_ICON_URL from 'assets/images/metamaskIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import Button from 'components/Button'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import Row from 'components/Row'
import useConnect, { connections, Web3Connection } from 'hooks/connectWeb3/useConnect'
import QRCode from 'qrcode'
import { useState } from 'react'
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
  connection: Web3Connection
  onClick: () => void
}

function WalletConnectButton({ walletName, logoSrc, caption, connection: wcConnection, onClick }: ButtonProps) {
  const [connector] = wcConnection as [WalletConnect, Web3ReactHooks]
  connector.activate()
  console.log('activated')

  const [qrCodeUri, setQrCodeUri] = useState<string>('')

  const [qrCodeSvg, setQrCodeImg] = useState<string>('')

  async function formatQrCodeImage(uri: string) {
    console.log('formatting qr code now')
    let result = ''
    const dataString = await QRCode.toString(uri, { margin: 0, type: 'svg' })
    if (typeof dataString === 'string') {
      result = dataString.replace('<svg', `<svg class="walletconnect-qrcode__image" alt="WalletConnect" width="100"`)
    }
    setQrCodeImg(result)
  }

  connector.provider?.connector.on('display_uri', async (err, payload) => {
    setQrCodeUri(payload.params[0])
    console.log('uri is', payload.params[0])
    await formatQrCodeImage(payload.params[0])
    // qrCodeSvg = await formatQrCodeImage(uri)
  })

  // useEffect(() => {
  //   let active = true
  //   if (qrCodeUri) formatQrCodeImage(qrCodeUri)
  //   return () => {
  //     active = false
  //   }

  //   async function formatQrCodeImage(uri: string) {
  //     console.log('formatting qr code now')
  //     let result = ''
  //     const dataString = await QRCode.toString(uri, { margin: 0, type: 'svg' })
  //     if (typeof dataString === 'string') {
  //       result = dataString.replace('<svg', `<svg class="walletconnect-qrcode__image" alt="WalletConnect" width="100"`)
  //     }
  //     if (!active) {
  //       return
  //     }
  //     setQrCodeImg(result)
  //   }
  // }, [qrCodeUri])

  return (
    <StyledMainButton disabled={true} onClick={useConnect(wcConnection)}>
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
        {/* <img src={qrCodeImg} alt={walletName} key={walletName} width={100} /> */}
      </StyledMainButtonRow>
    </StyledMainButton>
  )
}

function MetaMaskButton({ walletName, logoSrc, connection, onClick }: ButtonProps) {
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
  const [mmConnection, wcConnection] = connections
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
            connection={wcConnection}
            onClick={useConnect(wcConnection)}
          />
          <SecondaryOptionsRow>
            <MetaMaskButton
              walletName="MetaMask"
              logoSrc={METAMASK_ICON_URL}
              connection={mmConnection}
              onClick={useConnect(mmConnection)}
            />
            <NoWalletButton />
          </SecondaryOptionsRow>
        </Column>
      </Body>
    </>
  )
}
