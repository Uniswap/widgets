import { TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useAtomValue } from 'jotai/utils'
import { Field, stateAtom, Swap, swapAtom } from 'state/swap'
import { renderHook } from 'test'

import { DAI, USDC_MAINNET } from '../../constants/tokens'
import useSyncTokenDefaults, { TokenDefaults } from './useSyncTokenDefaults'

const web3React = require('@web3-react/core')

jest.mock('@web3-react/core')

const MOCK_DAI_MAINNET = DAI
const MOCK_USDC_MAINNET = USDC_MAINNET

const INITIAL_SWAP: Swap = {
  type: TradeType.EXACT_INPUT,
  amount: '10',
  [Field.INPUT]: MOCK_USDC_MAINNET,
  [Field.OUTPUT]: MOCK_DAI_MAINNET,
}

const TOKEN_DEFAULTS: TokenDefaults = {
  defaultInputAmount: 10,
  defaultInputTokenAddress: 'NATIVE',
  defaultOutputTokenAddress: 'NATIVE',
}

jest.mock('../useTokenList', () => {
  const original = jest.requireActual('../useTokenList')
  return {
    ...original,
    useIsTokenListLoaded: () => true,
  }
})

jest.mock('hooks/useCurrency', () => {
  const original = jest.requireActual('hooks/useCurrency')
  return {
    ...original,
    useToken: () => MOCK_DAI_MAINNET,
  }
})

describe('useSyncTokenDefaults', () => {
  it('syncs to default chainId on initial render if defaultChainId is provided', () => {
    web3React.useWeb3React.mockImplementation(() => ({
      chainId: SupportedChainId.MAINNET,
      connector: {},
    }))

    const { rerender } = renderHook(
      () => {
        useSyncTokenDefaults(TOKEN_DEFAULTS, SupportedChainId.POLYGON)
      },
      {
        initialAtomValues: [[stateAtom, INITIAL_SWAP]],
      }
    )

    const { result } = rerender(() => useAtomValue(swapAtom))
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: nativeOnChain(SupportedChainId.POLYGON),
      OUTPUT: nativeOnChain(SupportedChainId.POLYGON),
    })
    expect(web3React.useWeb3React).toHaveReturnedWith('hey')
  })

  it('does not sync to default chainId on initial render if is not provided', () => {
    web3React.useWeb3React.mockImplementation(() => ({
      chainId: SupportedChainId.MAINNET,
      connector: {},
    }))

    const { rerender } = renderHook(
      () => {
        useSyncTokenDefaults(TOKEN_DEFAULTS)
      },
      {
        initialAtomValues: [[stateAtom, INITIAL_SWAP]],
      }
    )

    const { result } = rerender(() => useAtomValue(swapAtom))
    expect(result.current).toMatchObject({
      ...INITIAL_SWAP,
      INPUT: nativeOnChain(SupportedChainId.MAINNET),
      OUTPUT: nativeOnChain(SupportedChainId.MAINNET),
    })
  })
})
