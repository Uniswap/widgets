import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'

import useInput from './useInput'
import useValidate from './useValidate'
import { Currency, Token } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'
import { useDispatchSwapValues, useSwapValues } from '../../'


export interface SwapToken {
  address: string,
  decimals: number,
}

export interface SwapField {
  amount?: string;
  currency?: SwapToken;
}
export interface SwapProps extends TokenDefaults, FeeOptions {
  chainId: number;
  children: JSX.Element | JSX.Element[] | null
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncConvenienceFee(props)
  useSyncTokenDefaults(props)
  
  const dispatchSwapValues = useDispatchSwapValues()
  const { uniswap: { input, output }} = useSwapValues();

  const {  chainId } = props;
  
  const { active } = useActiveWeb3React()
  const onSupportedNetwork = useOnSupportedNetwork()
  const isDisabled = !(active && onSupportedNetwork)
  const [inputCurrency, setInputCurrency] = useState<Currency | undefined>();
  const [outputCurrency, setOutputCurrency] = useState<Currency | undefined>();

  useEffect(() => {
    if (!input?.currency?.address) return;
    setInputCurrency(new Token(chainId, input.currency.address, input.currency.decimals))
  }, [input?.currency?.address])

  useEffect(() => {
    if (!output?.currency?.address) return;
    setOutputCurrency(new Token(chainId, output.currency.address, output.currency.decimals))
  }, [output?.currency?.address])

  useEffect(() => {
    const swapInput = useInput({ input: { disabled: isDisabled, amount: input?.amount, currency: inputCurrency }, output: { disabled: isDisabled, amount: output?.amount, currency: outputCurrency } })
  
    dispatchSwapValues({ uniswap: { values: swapInput }, type: 'setUniswapValues' })
  }, [input, output])
  return (
    <SwapInfoProvider disabled={isDisabled}>
      {props.children}
    </SwapInfoProvider>

  )
}
