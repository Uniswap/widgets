import { useWeb3React } from '@web3-react/core'
import ArgentWalletContractABI from 'lib/abis/argent-wallet-contract.json'
import { ArgentWalletContract } from 'lib/abis/types'

import { useContract } from './useContract'
import useIsArgentWallet from './useIsArgentWallet'

export function useArgentWalletContract(): ArgentWalletContract | null {
  const { account } = useWeb3React()
  const isArgentWallet = useIsArgentWallet()
  return useContract(
    isArgentWallet ? account ?? undefined : undefined,
    ArgentWalletContractABI,
    true
  ) as ArgentWalletContract
}
