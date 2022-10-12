import { Provider } from '@ethersproject/abstract-provider'
import { JsonRpcProvider } from '@ethersproject/providers'
import { getDefaultProvider, Signer } from 'ethers/lib/ethers'
import * as React from 'react'

export interface SignerI {
  provider: Provider
  jsonRpcProvider: JsonRpcProvider

  signer?: Signer
  address: string
  chainId: number

  // account is same as address
  account: string
  isActive: boolean
}

const defaultProvider = getDefaultProvider()

const SignerContext = React.createContext<SignerI>({
  provider: defaultProvider,
  jsonRpcProvider: new JsonRpcProvider(),
  signer: undefined,
  address: '',
  account: '',
  chainId: 137,
  isActive: true,
})

function SignerProvider({
  children,

  provider,
  jsonRpcProvider,

  signer,
  address,
  account = address,
  isActive = true,
  chainId,
}: SignerI & { children: React.ReactNode }) {
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  return (
    <SignerContext.Provider value={{ provider, jsonRpcProvider, signer, address, chainId, account, isActive }}>
      {children}
    </SignerContext.Provider>
  )
}

function useSigner() {
  const context = React.useContext(SignerContext)

  if (context === undefined) {
    throw new Error('useSigner must be used within a SignerProvider')
  }

  return context
}

export { SignerProvider, useSigner }
