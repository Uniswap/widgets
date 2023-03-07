import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

export const Context = createContext<{
  open: boolean
  collapse: () => void
  onToggleOpen: () => void
}>({
  open: false,
  collapse: () => null,
  onToggleOpen: () => null,
})

export function Provider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const onToggleOpen = () => setOpen((open) => !open)
  const collapse = () => setOpen(false)

  const isWrap = useIsWrap()
  useEffect(() => {
    if (isWrap) {
      collapse()
    }
  }, [isWrap])

  return <Context.Provider value={{ open, onToggleOpen, collapse }}>{children}</Context.Provider>
}

export function useCollapseToolbar() {
  const { collapse } = useContext(Context)
  return collapse
}
