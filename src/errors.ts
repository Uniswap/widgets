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

export interface WidgetPromise<T> extends Omit<Promise<T>, 'then' | 'catch'> {
  then: <V>(
    /** @throws {@link WidgetError} */
    onfulfilled: (value: T) => V
  ) => WidgetPromise<V>
  catch: <V>(
    /** @throws {@link WidgetError} */
    onrejected: (reason: WidgetError) => V
  ) => WidgetPromise<V>
}

export function toWidgetPromise<
  P extends { then(onfulfilled: (value: any) => any): any; catch(onrejected: (reason: any) => any): any },
  V extends Parameters<Parameters<P['then']>[0]>[0],
  R extends Parameters<Parameters<P['catch']>[0]>[0]
>(promise: P, mapRejection: (reason: R) => WidgetError): WidgetPromise<V> {
  return promise.catch(mapRejection) as WidgetPromise<V>
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
