import { t } from '@lingui/macro'

export const DEFAULT_ERROR_HEADER = t`Please refresh the page and try again.`
export const DEFAULT_ERROR_ACTION = t`Reload the page`

interface WidgetErrorConfig {
  header?: string
  action?: string
  message?: string
}

export abstract class WidgetError extends Error {
  header: string
  action: string

  constructor(config: WidgetErrorConfig) {
    super(config.message)
    this.header = config.header ?? DEFAULT_ERROR_HEADER
    this.action = config.action ?? DEFAULT_ERROR_ACTION
  }
}

export class IntegrationError extends WidgetError {
  constructor(message: string) {
    super({ message })
    this.name = 'IntegrationError'
  }
}

class ConnectionError extends WidgetError {
  constructor(config: WidgetErrorConfig) {
    super(config)
    this.name = 'ConnectionError'
  }
}

export class MetaMaskConnectionError extends ConnectionError {
  constructor() {
    super({
      header: t`Wallet disconnected`,
      action: t`Reload`,
      message: t`'A Metamask error caused your wallet to disconnect. Reload the page to reconnect.'`,
    })
  }
}
