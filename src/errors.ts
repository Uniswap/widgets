import { t } from '@lingui/macro'

export const DEFAULT_ERROR_HEADER = t`Sorry, an error occured while processing your request. Please try again or contact support.`
export const DEFAULT_ERROR_ACTION = t`Reload the page`

const DEFAULT_DISMISSABLE_ERROR_ACTION = t`Dismiss`

interface WidgetErrorConfig {
  header?: string
  action?: string
  message?: string
  error?: unknown
}

export class WidgetError extends Error {
  header: string
  action: string
  /** The original error, if this is a wrapped error. */
  error: unknown
  dismissable = false

  constructor(config: WidgetErrorConfig) {
    super(config.message)
    this.header = config.header ?? DEFAULT_ERROR_HEADER
    this.action = config.action ?? DEFAULT_ERROR_ACTION
    this.error = config.error
    this.name = 'WidgetError'
  }
}

export class WidgetPromise<V, R extends WidgetError = WidgetError> extends Promise<V> {
  static from<
    P extends { then(onfulfilled: (value: any) => any): any; catch(onrejected: (reason: any) => any): any },
    V extends Parameters<Parameters<P['then']>[0]>[0],
    R extends Parameters<Parameters<P['catch']>[0]>[0],
    WidgetPromiseValue = V,
    WidgetPromiseReason extends WidgetError = WidgetError
  >(
    promise: P,
    /** Synchronously maps the value to the widget promise value. Any thrown reason must be mappable by onrejected. */
    onfulfilled?: ((value: V) => WidgetPromiseValue) | null,
    /** Synchronously maps the reason to the widget promise reason. Must throw the mapped reason. */
    onrejected?: ((reason: R) => never) | null
  ): WidgetPromise<WidgetPromiseValue, WidgetPromiseReason> {
    return promise.then(onfulfilled ?? ((v) => v)).catch((reason: R) => {
      throw onrejected ? onrejected(reason) : reason
    }) as WidgetPromise<WidgetPromiseValue, WidgetPromiseReason>
  }

  catch<T = never>(onrejected?: ((reason: R) => T | Promise<T>) | undefined | null): Promise<V | T> {
    return super.catch(onrejected)
  }
}

/** Integration errors are considered fatal. They are caused by invalid integrator configuration. */
export class IntegrationError extends WidgetError {
  constructor(message: string) {
    super({ message })
    this.name = 'IntegrationError'
  }
}

/** Dismissable errors are not be considered fatal by the ErrorBoundary. */
export class DismissableError extends WidgetError {
  constructor(config: WidgetErrorConfig) {
    super({
      ...config,
      action: config.action ?? DEFAULT_DISMISSABLE_ERROR_ACTION,
      header: config.header ?? DEFAULT_ERROR_HEADER,
    })
    this.name = 'DismissableError'
    this.dismissable = true
  }
}

export class UserRejectedRequestError extends DismissableError {
  constructor() {
    super({
      header: t`Request rejected`,
      message: t`This error was prompted by denying a request in your wallet.`,
    })
    this.name = 'UserRejectedRequestError'
  }
}

/** Connection errors are considered fatal. They are caused by wallet integrations. */
abstract class ConnectionError extends WidgetError {
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
