import { renderHook } from '@testing-library/react'
import { TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { DAI_POLYGON, nativeOnChain } from 'constants/tokens'
import { USDC_MAINNET } from 'constants/tokens'
import { Provider as AtomProvider } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { PropsWithChildren } from 'react'
import { Field, stateAtom, Swap, swapAtom } from 'state/swap'

import useSyncTokenDefaults, { TokenDefaults } from './useSyncTokenDefaults'

const MOCK_DAI_POLYGON = DAI_POLYGON
const MOCK_USDC_MAINNET = USDC_MAINNET

const INITIAL_SWAP: Swap = {
  type: TradeType.EXACT_INPUT,
  amount: '10',
  [Field.INPUT]: MOCK_USDC_MAINNET,
  [Field.OUTPUT]: MOCK_DAI_POLYGON,
}

const TOKEN_DEFAULTS: TokenDefaults = {
  defaultInputAmount: 10,
  defaultInputTokenAddress: 'NATIVE',
  defaultOutputTokenAddress: 'NATIVE',
}

jest.mock('@web3-react/core', () => {
  const { SupportedChainId } = jest.requireActual('constants/chains')
  const connector = {}
  return {
    useWeb3React: () => ({
      chainId: SupportedChainId.MAINNET,
      connector,
    }),
  }
})

jest.mock('../useTokenList', () => {
  return {
    useIsTokenListLoaded: () => true,
  }
})

jest.mock('hooks/useCurrency', () => {
  return {
    useToken: () => MOCK_DAI_POLYGON,
  }
})

describe('useSyncTokenDefaults', () => {
  function Wrapper({ children }: PropsWithChildren) {
    return <AtomProvider initialValues={[[stateAtom, INITIAL_SWAP]]}>{children}</AtomProvider>
  }

  it('syncs to default chainId on initial render if defaultChainId is provided', () => {
    const { result } = renderHook(
      () => {
        useSyncTokenDefaults({ ...TOKEN_DEFAULTS, defaultChainId: SupportedChainId.POLYGON })
        return useAtomValue(swapAtom)
      },
      { wrapper: Wrapper }
    )
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: nativeOnChain(SupportedChainId.POLYGON),
      OUTPUT: nativeOnChain(SupportedChainId.POLYGON),
    })
  })

  it('does not sync to default chainId on initial render if defaultChainId is not provided', () => {
    const { result } = renderHook(
      () => {
        useSyncTokenDefaults(TOKEN_DEFAULTS)
        return useAtomValue(swapAtom)
      },
      { wrapper: Wrapper }
    )
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: nativeOnChain(SupportedChainId.MAINNET),
      OUTPUT: nativeOnChain(SupportedChainId.MAINNET),
    })
  })

  it('syncs to default non NATIVE tokens of default chainId on initial render if defaultChainId is provided', () => {
    const { result } = renderHook(
      () => {
        useSyncTokenDefaults({
          ...TOKEN_DEFAULTS,
          defaultInputTokenAddress: DAI_POLYGON.address,
          defaultOutputTokenAddress: DAI_POLYGON.address,
          defaultChainId: SupportedChainId.POLYGON,
        })
        return useAtomValue(swapAtom)
      },
      { wrapper: Wrapper }
    )
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: DAI_POLYGON,
      OUTPUT: DAI_POLYGON,
    })
  })

  it('syncs to non NATIVE tokens of chainId on initial render if defaultChainId is not provided', () => {
    const { result } = renderHook(
      () => {
        useSyncTokenDefaults(TOKEN_DEFAULTS)
        return useAtomValue(swapAtom)
      },
      { wrapper: Wrapper }
    )
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: nativeOnChain(SupportedChainId.MAINNET),
      OUTPUT: nativeOnChain(SupportedChainId.MAINNET),
    })
  })
})
