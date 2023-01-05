import { DEFAULT_ERROR_ACTION, DEFAULT_ERROR_HEADER, WidgetError } from 'errors'
import { Component, ErrorInfo, PropsWithChildren, useCallback, useState } from 'react'

import Dialog from '../Dialog'
import ErrorDialog from './ErrorDialog'

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
  const [, setError] = useState()
  return useCallback(
    (error: unknown) =>
      setError(() => {
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

  renderErrorDialog(error: Error) {
    const header = error instanceof WidgetError ? error.header : DEFAULT_ERROR_HEADER
    const action = error instanceof WidgetError ? error.action : DEFAULT_ERROR_ACTION
    return (
      <Dialog color="dialog">
        <ErrorDialog error={error} header={header} action={action} onClick={() => window.location.reload()} />
      </Dialog>
    )
  }

  render() {
    if (this.state.error) {
      return this.renderErrorDialog(this.state.error)
    }
    return this.props.children
  }
}
