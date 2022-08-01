import { tokens } from '@uniswap/default-token-list'
import { Token } from '@uniswap/sdk-core'
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
import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'

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

  const inputToken = useOption('inputToken', {
    options: Object.keys(currencies),
    defaultValue: `${SupportedChainId.MAINNET}-${USDC[SupportedChainId.MAINNET].symbol}`,
  })
  const [inputTokenAmount] = useValue('inputTokenAmount', { defaultValue: 1 })
  const outputToken = useOption('outputToken', { options: Object.keys(currencies) })
  const [outputTokenAmount] = useValue('outputTokenAmount', { defaultValue: 0 })

  let integratorInputToken = inputToken
  return (
    <SwapWidget
      convenienceFee={convenienceFee}
      convenienceFeeRecipient={convenienceFeeRecipient}
      locale={locale}
      jsonRpcEndpoint={jsonRpcEndpoint}
      provider={connector}
      theme={theme}
      tokenList={tokenList}
      width={width}
      routerUrl={routerUrl}
      onConnectWallet={() => console.log('onConnectWallet')} // this handler is included as a test of functionality, but only logs
      // controlled values
      inputToken={integratorInputToken ? currencies[integratorInputToken] : undefined}
      inputTokenOnChange={() => console.log('inputTokenOnChange')}
      inputTokenSelectorActive={false}
      outputToken={outputToken ? currencies[outputToken] : undefined}
      outputTokenOnChange={() => console.log('outputTokenOnChange')}
      outputTokenSelectorActive={false}
      inputTokenAmount={inputTokenAmount}
      inputTokenAmountOnChange={() => console.log('inputTokenAmountOnChange')}
      outputTokenAmount={outputTokenAmount}
      outputTokenAmountOnChange={() => console.log('outputTokenAmountOnChange')}
    />
  )
}

export default <Fixture />
