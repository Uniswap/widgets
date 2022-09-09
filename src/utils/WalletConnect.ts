import { WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect'

export class WalletConnectPopup extends WalletConnect {
  constructor({ actions, options, defaultChainId, timeout, onError }: WalletConnectConstructorArgs) {
    super({ actions, options: { ...options, qrcode: true }, defaultChainId, timeout, onError })
    this.provider?.connector.on('display_uri', (e) => console.log('ZZMP:display_uri', e))
    this.provider?.connector.on('session_delete', (e) => console.log('ZZMP:session_delete', e))
  }
}

export class WalletConnectURL extends WalletConnect {
  private _url?: string

  get url() {
    // TODO(zzmp): Fetch the URL, and setup appropriate listeners.
    return this._url
  }

  constructor({ actions, options, defaultChainId, timeout, onError }: WalletConnectConstructorArgs) {
    super({ actions, options: { ...options, qrcode: false }, defaultChainId, timeout, onError })
    void this.url
  }
}
