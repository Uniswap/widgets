import { createContext, PropsWithChildren, useContext } from 'react'

const Context = createContext<string | undefined>(undefined)

export function RouterUrlProvider({ children, routerUrl }: PropsWithChildren<{ routerUrl?: string }>) {
  return <Context.Provider value={routerUrl ?? undefined}>{children}</Context.Provider>
}

export function useRouterUrl(): string | undefined {
  return useContext(Context)
}
