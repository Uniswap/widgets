import { JsonRpcProvider } from '@ethersproject/providers'
import { Provider as Eip1193Provider, RequestArguments } from '@web3-react/types'
import EventEmitter from 'events'

export default class Eip1193ProviderFromEthers extends EventEmitter implements Eip1193Provider {
  constructor(public customProvider: JsonRpcProvider) {
    super()
  }
  request(args: RequestArguments): Promise<unknown> {
    return this.customProvider.perform(args.method, args.params)
  }
}
