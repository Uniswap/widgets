import { t } from '@lingui/macro'
import { DEFAULT_ERROR_HEADER, UserRejectedRequestError, WidgetError } from 'errors'
import { Component, ErrorInfo, PropsWithChildren, useCallback, useState } from 'react'

import ErrorView from './ErrorView'

export type OnError = (error: Error, info?: ErrorInfo) => void

interface ErrorBoundaryProps {
  onError?: OnError
}

type ErrorBoundaryState = {
  error?: Error
}

/**
 * Throws an error from outside of the React lifecycle.
 * Errors thrown through this method will correctly trigger the ErrorBoundary.
 *
 * @example
 * const throwError = useAsyncError()
 * useEffect(() => {
 *   fetch('http://example.com')
 *     .catch((e: Error) => {
 *       throwError(toWidgetError(e))
 *     })
 * }, [throwError])
 */
export function useAsyncError() {
  const [, setError] = useState<void>()
  return useCallback(
    (error: unknown) =>
      setError(() => {
        // Ignore user rejections - they should not trigger the ErrorBoundary
        if (error instanceof UserRejectedRequestError) return

        if (error instanceof Error) throw error
        throw new Error(error as string)
      }),
    []
  )
}

export default class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {}
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  renderErrorView(error: Error) {
    const header = error instanceof WidgetError ? error.header : DEFAULT_ERROR_HEADER
    return (
      <ErrorView
        message={header}
        error={error}
        action={t`Get support`}
        onDismiss={
          error instanceof WidgetError && error.dismissable
            ? () => {
                this.setState({ error: undefined })
              }
            : () => window.location.reload()
        }
        onClick={() => {
          window.open('https://support.uniswap.org/', '_blank', 'noopener,noreferrer')
        }}
      />
    )
  }

  render() {
    if (this.state.error) {
      return this.renderErrorView(this.state.error)
    }
    return this.props.children
  }
}
