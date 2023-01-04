import { t } from '@lingui/macro'

export class IntegrationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Integration Error'
  }
}

export const DEFAULT_ERROR_HEADER = t`Please refresh the page and try again.`
export const DEFAULT_ERROR_ACTION = t`Reload the page`

export abstract class WidgetError extends Error {
  header: string = DEFAULT_ERROR_HEADER
  action: string = DEFAULT_ERROR_ACTION

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

class ConnectionError extends WidgetError {}

export class MetaMaskConnectionError extends ConnectionError {
  constructor() {
    super({
      header: t`Wallet disconnected`,
      action: t`Reload`,
      message: t`'A Metamask error caused your wallet to disconnect. Reload the page to reconnect.'`,
    })
  }
}
