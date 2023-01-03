import { t } from '@lingui/macro'

export class IntegrationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Integration Error'
  }
}

const DefaultErrorHeader = t`Please refresh the page and try again.`
const DefaultErrorAction = t`Reload the page`

export abstract class WidgetError extends Error {
  header: string = DefaultErrorHeader
  action: string = DefaultErrorAction

  constructor(config: { header?: string; action?: string; message?: string }) {
    super(config.message)
    if (config.header) {
      this.header = config.header
    }
    if (config.action) {
      this.action = config.action
    }
  }
}

export class GenericWidgetError extends WidgetError {
  constructor(message?: string) {
    super({
      header: DefaultErrorHeader,
      action: DefaultErrorAction,
      message,
    })
    this.name = 'Generic Widget Error'
  }
}

class ConnectionError extends WidgetError {}

export class MetaMaskConnectionError extends ConnectionError {
  constructor() {
    super({
      header: t`Wallet disconnected`,
      action: t`Reload`,
      message: t`'A Metamask error caused your wallet to disconnect. Reload the page to reconnect.'`,
    })
    this.name = 'MetaMask Connection Error'
  }
}
