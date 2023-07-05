import { URI_AVAILABLE, WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect-v2'
import QRCode from 'qrcode'

export class WalletConnectPopup extends WalletConnect {
  ANALYTICS_EVENT = 'Wallet Connect QR Scan'
  constructor({ actions, onError, options }: WalletConnectConstructorArgs) {
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
  constructor(config: WalletConnectConstructorArgs) {
    super(config)
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
