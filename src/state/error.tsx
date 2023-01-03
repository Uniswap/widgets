import { createContext, PropsWithChildren, useState } from 'react'

export const ErrorContext = createContext<{
  error: Error | undefined
  setError: (e: Error) => void
}>({
  error: undefined,
  setError: () => null,
})

export const ErrorContextProvider = (props: PropsWithChildren<Record<string, unknown>>) => {
  const [error, setError] = useState<Error | undefined>(undefined)
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
