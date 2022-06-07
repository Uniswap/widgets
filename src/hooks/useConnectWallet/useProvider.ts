import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { useCallback, useEffect, useState } from 'react'
import type { Web3Provider } from '@ethersproject/providers'
import { getPriorityConnector } from '@web3-react/core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

export type Web3Connector = [Connector, Web3ReactHooks]

export function toWeb3Connector<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
    T,
    Web3ReactHooks
    ] {
    return [connector, hooks]
}

export function getConnectors() {
    const {library} = useActiveWeb3React()

    const mmConnector = toWeb3Connector(initializeConnector<MetaMask>((actions) => new MetaMask(actions)))
    const wcConnector = toWeb3Connector(initializeConnector<WalletConnect>(
        (actions) =>
          new WalletConnect(
            actions,
            {
              rpc: { 1: library?.connection.url || 'http://localhost:8545' },
            },
            false
          )
      )) //todo: wc only works on network chainid 1?
      
    return [mmConnector, wcConnector]
}

export function useActiveProvider(): Web3Provider | undefined {
    return getPriorityConnector(...getConnectors()).usePriorityProvider() as Web3Provider
}
