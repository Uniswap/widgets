import { Currency } from '@uniswap/sdk-core'

export interface ControlledStateProps {
  inputToken?: Currency
  inputTokenOnChange?: (t: Currency) => void
  inputTokenSelectorActive?: boolean

  outputToken?: Currency
  outputTokenOnChange?: (t: Currency) => void
  outputTokenSelectorActive?: boolean

  inputTokenAmount?: string | number // BigIntIsh? which = JSBI | string | number
  inputTokenAmountOnChange: (n: string) => void

  outputTokenAmount?: string | number // BigIntIsh?
  outputTokenAmountOnChange?: (n: string) => void
}

// export default function useSyncTokenDefaults({
//   defaultInputTokenAddress,
//   defaultInputAmount,
//   defaultOutputTokenAddress,
//   defaultOutputAmount,
// }: TokenDefaults) {
//   const updateSwap = useUpdateAtom(swapAtom)
//   const { chainId } = useActiveWeb3React()
//   const onSupportedNetwork = useOnSupportedNetwork()
//   const nativeCurrency = useNativeCurrency()
//   const defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId)
//   const defaultInputToken =
//     useDefaultToken(defaultInputTokenAddress, chainId) ??
//     // Default the input token to the native currency if it is not the output token.
//     (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)

//   const setToDefaults = useCallback(() => {
//     const defaultSwapState: Swap = {
//       amount: '',
//       [Field.INPUT]: defaultInputToken,
//       [Field.OUTPUT]: defaultOutputToken,
//       independentField: Field.INPUT,
//     }
//     if (defaultInputToken && defaultInputAmount) {
//       defaultSwapState.amount = defaultInputAmount.toString()
//     } else if (defaultOutputToken && defaultOutputAmount) {
//       defaultSwapState.independentField = Field.OUTPUT
//       defaultSwapState.amount = defaultOutputAmount.toString()
//     }
//     updateSwap((swap) => ({ ...swap, ...defaultSwapState }))
//   }, [defaultInputAmount, defaultInputToken, defaultOutputAmount, defaultOutputToken, updateSwap])

//   const lastChainId = useRef<number | undefined>(undefined)
//   const isTokenListLoaded = useIsTokenListLoaded()
//   useEffect(() => {
//     const shouldSync = isTokenListLoaded && chainId && chainId !== lastChainId.current
//     if (shouldSync) {
//       setToDefaults()
//       lastChainId.current = chainId
//     }
//   }, [isTokenListLoaded, chainId, setToDefaults])
// }
