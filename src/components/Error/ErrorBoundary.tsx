import { DEFAULT_ERROR_ACTION, DEFAULT_ERROR_HEADER, WidgetError } from 'errors'
import { Component, createContext, ErrorInfo, PropsWithChildren, useContext } from 'react'

import Dialog from '../Dialog'
import ErrorDialog from './ErrorDialog'

const ErrorContext = createContext<{ setError: (e: WidgetError) => void }>({ setError: () => undefined })

export type OnError = (error: Error, info?: ErrorInfo) => void

interface ErrorBoundaryProps {
  onError?: OnError
}

type ErrorBoundaryState = {
  error?: Error
}

export function useSetError() {
  return useContext(ErrorContext).setError
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

  setError(error: WidgetError) {
    this.props.onError?.(error)
    this.setState({ error })
  }

  render() {
    if (this.state.error) {
      return this.renderErrorDialog(this.state.error)
    }
    return <ErrorContext.Provider value={{ setError: this.setError }}>{this.props.children}</ErrorContext.Provider>
  }
}
