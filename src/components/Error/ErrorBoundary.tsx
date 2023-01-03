import { GenericWidgetError, WidgetError } from 'errors'
import { Component, createContext, ErrorInfo, PropsWithChildren, useState } from 'react'

import Dialog from '../Dialog'
import ErrorDialog from './ErrorDialog'

const ErrorContext = createContext<{
  error: WidgetError | undefined
  setError: (e: WidgetError) => void
}>({
  error: undefined,
  setError: () => null,
})

export const Provider = (props: PropsWithChildren) => {
  const [error, setError] = useState<WidgetError | undefined>(undefined)
  return (
    <ErrorContext.Provider
      value={{
        error,
        setError,
      }}
    >
      {props.children}
    </ErrorContext.Provider>
  )
}

export type OnError = (error: Error, info: ErrorInfo) => void

interface ErrorBoundaryProps {
  // A preset error may come from app state (a parent Context) rather than a thrown error
  error?: Error | undefined
  onError?: OnError
}

type ErrorBoundaryState = {
  error: Error | null
}

export default class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
  static contextType = ErrorContext
  context!: React.ContextType<typeof ErrorContext>

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  getErrorDialog(error: WidgetError) {
    return (
      <Dialog color="dialog">
        <ErrorDialog
          error={error}
          header={error.header}
          action={error.action}
          onClick={() => window.location.reload()}
        />
      </Dialog>
    )
  }

  render() {
    const { error } = this.context

    if (error != null || this.state.error != null) {
      return this.getErrorDialog(error ?? new GenericWidgetError(this.state.error?.message))
    }
    return this.props.children
  }
}
