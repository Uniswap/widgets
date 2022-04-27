/* eslint-disable react-hooks/rules-of-hooks */
import { Web3Provider } from '@ethersproject/providers'
import { default as useWidgetsWeb3React } from 'lib/hooks/useActiveWeb3React'
import { useWeb3React } from 'web3-react-core'

import { NetworkContextName } from '../constants/misc'

export default function useActiveWeb3React() {
    return useWidgetsWeb3React()
}
