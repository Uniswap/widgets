import { Buffer } from 'buffer'

// WalletConnect relies on Buffer, so it must be polyfilled.
if (!('Buffer' in window)) {
  window.Buffer = Buffer
}
