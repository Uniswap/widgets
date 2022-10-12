import ArgentWalletContractABI from 'abis/argent-wallet-contract.json'
import { ArgentWalletContract } from 'abis/types'
import { useSigner } from 'components/SignerProvider'

import { useContract } from './useContract'
import useIsArgentWallet from './useIsArgentWallet'

export function useArgentWalletContract(): ArgentWalletContract | null {
  const { account } = useSigner()
  const isArgentWallet = useIsArgentWallet()
  return useContract(
    isArgentWallet ? account ?? undefined : undefined,
    ArgentWalletContractABI,
    true
  ) as ArgentWalletContract
}
