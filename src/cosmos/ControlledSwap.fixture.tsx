import { tokens } from '@uniswap/default-token-list'
import { Currency, Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'
import {
  darkTheme,
  DEFAULT_LOCALE,
  defaultTheme,
  lightTheme,
  SUPPORTED_LOCALES,
  SupportedChainId,
  SwapWidget,
} from '@uniswap/widgets'
import { useEffect, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { Field } from 'state/swap'

import { UNI, USDC } from '../constants/tokens'
import useJsonRpcEndpoint from './useJsonRpcEndpoint'
import useOption from './useOption'
import useProvider from './useProvider'

function Fixture() {
  const [convenienceFee] = useValue('convenienceFee', { defaultValue: 0 })
  const convenienceFeeRecipient = useOption('convenienceFeeRecipient', {
    options: [
      '0x1D9Cd50Dde9C19073B81303b3d930444d11552f7',
      '0x0dA5533d5a9aA08c1792Ef2B6a7444E149cCB0AD',
      '0xE6abE059E5e929fd17bef158902E73f0FEaCD68c',
    ],
  })

  const currencies: { [tokenName: string]: Token } = {
    ...Object.entries(UNI).reduce(
      (acc, [chainId, token]: any) => ({ ...acc, [`${chainId}-${token.symbol}`]: token }),
      {}
    ),
    ...Object.entries(USDC).reduce(
      (acc, [chainId, token]: any) => ({ ...acc, [`${chainId}-${token.symbol}`]: token }),
      {}
    ),
  }

  const [width] = useValue('width', { defaultValue: 360 })

  const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: { ...defaultTheme } })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const jsonRpcEndpoint = useJsonRpcEndpoint()
  const connector = useProvider()

  const tokenLists: Record<string, TokenInfo[]> = {
    Default: tokens,
    'Mainnet only': tokens.filter((token) => token.chainId === SupportedChainId.MAINNET),
  }
  const tokenList = useOption('tokenList', { options: tokenLists, defaultValue: 'Default', nullable: false })
  console.log(tokenList)

  const [routerUrl] = useValue('routerUrl', { defaultValue: 'https://api.uniswap.org/v1/' })

  const [defaultTokenSelectorDisabled] = useValue('defaultTokenSelectorDisabled', { defaultValue: false })
  const inputTokenName = useOption('inputToken', {
    options: Object.keys(currencies),
    defaultValue: `${SupportedChainId.MAINNET}-${USDC[SupportedChainId.MAINNET].symbol}`,
  })
  const outputTokenName = useOption('outputToken', { options: Object.keys(currencies) })

  let it: Currency | undefined = inputTokenName ? currencies[inputTokenName] : undefined
  let ot: Currency | undefined = outputTokenName ? currencies[outputTokenName] : undefined
  const [inputToken, setInputToken] = useState<Currency | undefined>(undefined)
  // if (it !== inputToken) setInputToken(it)
  const [outputToken, setOutputToken] = useState<Currency | undefined>(undefined)
  // if (ot !== inputToken) setOutputToken(ot)

  const inputTokenOnChange = (curr: Currency) => {
    console.log('inputTokenOnChange', curr)
    setInputToken(curr)
  }
  const outputTokenOnChange = (curr: Currency) => {
    console.log('outputTokenOnChange', curr)
    setOutputToken(curr)
  }

  const [amount, setAmount] = useState<string | number | undefined>(undefined)
  const [amt] = useValue('amount', { defaultValue: 1 })
  useEffect(() => {
    if (amt !== amount) setAmount(amt)
  }, [amt])
  const amountOnChange = (amount: string | number) => {
    console.log('amountOnChange', amount)
    setAmount(amount)
  }

  const [independentField, setIndependentField] = useState<Field | undefined>(undefined)
  const indptField = useOption<Field>('independentField', {
    options: [Field.INPUT, Field.OUTPUT],
    defaultValue: Field.INPUT,
  })
  useEffect(() => {
    if (indptField !== independentField) setIndependentField(indptField)
  }, [indptField])
  const independentFieldOnChange = (f: Field) => {
    console.log('independentFieldOnChange', f)
    setIndependentField(f)
  }

  return (
    <SwapWidget
      convenienceFee={convenienceFee}
      convenienceFeeRecipient={convenienceFeeRecipient}
      defaultTokenSelectorDisabled={defaultTokenSelectorDisabled}
      locale={locale}
      jsonRpcEndpoint={jsonRpcEndpoint}
      provider={connector}
      theme={theme}
      tokenList={tokenList}
      width={width}
      routerUrl={routerUrl}
      onConnectWallet={() => console.log('onConnectWallet')} // this handler is included as a test of functionality, but only logs
      // controlled values
      inputToken={inputToken}
      inputTokenOnChange={inputTokenOnChange}
      outputToken={outputToken}
      outputTokenOnChange={outputTokenOnChange}
      amount={amount}
      amountOnChange={amountOnChange}
      independentField={independentField}
      independentFieldOnChange={independentFieldOnChange}
    />
  )
}

export default <Fixture />
