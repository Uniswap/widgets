import { act, renderHook } from '@testing-library/react'
import { UserRejectedRequestError } from 'errors'

import { useAsyncError } from './ErrorBoundary'

describe('useAsyncError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('throws an Error', () => {
    const error = new Error()
    const { result } = renderHook(useAsyncError)
    expect(() => act(() => result.current(error))).toThrowError(error)
  })

  it('throws a string as a wrapped Error', () => {
    const { result } = renderHook(useAsyncError)
    expect(() => act(() => result.current('error'))).toThrowError('error')
  })

  it('does not throw a UserRejectedRequestError', () => {
    const { result } = renderHook(useAsyncError)
    expect(() => act(() => result.current(new UserRejectedRequestError()))).not.toThrow()
  })
})
