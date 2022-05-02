import { tokens } from '@uniswap/default-token-list'
import { darkTheme, DEFAULT_LOCALE, defaultTheme, lightTheme, SUPPORTED_LOCALES, SwapWidget } from '@uniswap/widgets'
import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'

import { DAI, USDC_MAINNET } from '../constants/tokens'
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

  // TODO(zzmp): Changing defaults has no effect if done after the first render.
  const currencies: Record<string, string> = {
    Native: 'NATIVE',
    DAI: DAI.address,
    USDC: USDC_MAINNET.address,
  }
  const defaultInputToken = useOption('defaultInputToken', { options: currencies, defaultValue: 'Native' })
  const [defaultInputAmount] = useValue('defaultInputAmount', { defaultValue: 1 })
  const defaultOutputToken = useOption('defaultOutputToken', { options: currencies })
  const [defaultOutputAmount] = useValue('defaultOutputAmount', { defaultValue: 0 })

  const [width] = useValue('width', { defaultValue: 360 })

  const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: { ...defaultTheme } })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const jsonRpcEndpoint = useJsonRpcEndpoint()
  const connector = useProvider()

  return (
    <SwapWidget
      convenienceFee={convenienceFee}
      convenienceFeeRecipient={convenienceFeeRecipient}
      defaultInputTokenAddress={defaultInputToken}
      defaultInputAmount={defaultInputAmount}
      defaultOutputTokenAddress={defaultOutputToken}
      defaultOutputAmount={defaultOutputAmount}
      locale={locale}
      jsonRpcEndpoint={jsonRpcEndpoint}
      provider={connector}
      theme={theme}
      tokenList={tokens}
      width={width}
      onConnectWallet={() => console.log('onConnectWallet')} // this handler is included as a test of functionality, but only logs
    />
  )
}

export default <Fixture />
