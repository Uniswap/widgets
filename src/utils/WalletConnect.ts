import { URI_AVAILABLE, WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect-v2'
import { L1_CHAIN_IDS, L2_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import QRCode from 'qrcode'


// Avoid testing for the best URL by only passing a single URL per chain.
// Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react).
const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(JSON_RPC_FALLBACK_ENDPOINTS).reduce(
  (map, [chainId, urls]) => ({
    ...map,
    [chainId]: urls[0],
  }),
  {}
)
const optionalChains = [...L1_CHAIN_IDS, ...L2_CHAIN_IDS].filter((x) => x !== SupportedChainId.MAINNET)

export class WalletConnectPopup extends WalletConnect {
  ANALYTICS_EVENT = 'Wallet Connect QR Scan'
  constructor({
    actions,
    onError,
    options
  }: WalletConnectConstructorArgs) {
    super({
      actions,
      options,
      onError,
    })
  }
}

export class WalletConnectQR extends WalletConnect {
  static SVG_AVAILABLE = 'svg_available'
  svg?: string
  constructor({
    actions,
    onError,
    options,
  }: WalletConnectConstructorArgs) {
    super({
      actions,
      options,
      onError,
    })
    this.events.on(URI_AVAILABLE, async (uri) => {
      this.svg = undefined
      if (!uri) return
      this.svg = await QRCode.toString(uri, {
        margin: 1,
        width: 110,
        type: 'svg',
      })
      this.events.emit(WalletConnectQR.SVG_AVAILABLE, this.svg)
    })
    this.events.emit(WalletConnectQR.SVG_AVAILABLE, this.svg)
  }
    deactivate() {
    this.events.emit(URI_AVAILABLE)
    return super.deactivate()
  }
}