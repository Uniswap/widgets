import { useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Field } from 'state/swap'

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
  const {
    [Field.INPUT]: { currency: inputCurrency },
    [Field.OUTPUT]: { currency: outputCurrency },
  } = useSwapInfo()
  const isWrap = useIsWrap()

  useEffect(() => {
    if (isWrap) {
      collapse()
    }
    if (!inputCurrency || !outputCurrency) {
      collapse()
    }
  }, [isWrap, inputCurrency, outputCurrency])

  return <Context.Provider value={{ open, onToggleOpen, collapse }}>{children}</Context.Provider>
}

export function useCollapseToolbar() {
  const { collapse } = useContext(Context)
  return collapse
}
