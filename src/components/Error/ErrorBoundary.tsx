import { Trans } from '@lingui/macro'
import { Component, ErrorInfo, PropsWithChildren } from 'react'

import Dialog from '../Dialog'
import ErrorDialog from './ErrorDialog'

export type OnError = (error: Error, info: ErrorInfo) => void

interface ErrorBoundaryProps {
  onError?: OnError
}

type ErrorBoundaryState = {
  error: Error | null
}

export default class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
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

  render() {
    if (this.state.error) {
      return (
        <Dialog color="dialog">
          <ErrorDialog
            error={this.state.error}
            header={<Trans>Please refresh the page and try again.</Trans>}
            action={<Trans>Reload the page</Trans>}
            onClick={() => window.location.reload()}
          />
        </Dialog>
      )
    }
    return this.props.children
  }
}
