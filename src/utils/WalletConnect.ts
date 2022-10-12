import 'setimmediate'

import { URI_AVAILABLE, WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect'
import QRCode from 'qrcode'

export class WalletConnectPopup extends WalletConnect {
  constructor({ actions, options, defaultChainId, timeout, onError }: WalletConnectConstructorArgs) {
    super({ actions, options: { ...options, qrcode: true }, defaultChainId, timeout, onError })
  }
}

export class WalletConnectQR extends WalletConnect {
  static SVG_AVAILABLE = 'svg_available'

  svg?: string

  constructor({ actions, options, defaultChainId, timeout, onError }: WalletConnectConstructorArgs) {
    super({ actions, options: { ...options, qrcode: false }, defaultChainId, timeout, onError })

    this.events.once(URI_AVAILABLE, () => {
      this.provider?.connector.on('disconnect', () => {
        this.deactivate()
      })
    })

    this.events.on(URI_AVAILABLE, async (uri) => {
      this.svg = undefined
      if (!uri) return

      this.svg = await QRCode.toString(uri, {
        // Leave a margin to increase contrast in dark mode.
        margin: 1,
        // Use 55*2=110 for the width to prevent distortion. The generated viewbox is "0 0 55 55".
        width: 110,
        type: 'svg',
      })
      this.events.emit(WalletConnectQR.SVG_AVAILABLE, this.svg)
    })
  }

  deactivate() {
    this.events.emit(URI_AVAILABLE)
    return super.deactivate()
  }
}
