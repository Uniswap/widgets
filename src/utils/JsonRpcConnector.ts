import { JsonRpcProvider } from '@ethersproject/providers'
import { Actions, Connector, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

export default class JsonRpcConnector extends Connector {
  public customProvider: JsonRpcProvider

  constructor({
    actions,
    provider,
    onError,
  }: {
    actions: Actions
    provider: JsonRpcProvider
    onError?: (error: Error) => void
  }) {
    super(actions, onError)
    this.customProvider = provider
      .on('connect', ({ chainId }: ProviderConnectInfo): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      })
      .on('disconnect', (error: ProviderRpcError): void => {
        this.onError?.(error)
        this.actions.resetState()
      })
      .on('chainChanged', (chainId: string): void => {
        this.actions.update({ chainId: parseChainId(chainId) })
      })
      .on('accountsChanged', (accounts: string[]): void => {
        this.actions.update({ accounts })
      })
  }

  async activate() {
    this.actions.startActivation()

    try {
      const [{ chainId }, accounts] = await Promise.all([
        this.customProvider.getNetwork(),
        this.customProvider.listAccounts(),
      ])
      this.actions.update({ chainId, accounts })
    } catch (e) {
      this.actions.resetState()
      throw e
    }
  }
}
