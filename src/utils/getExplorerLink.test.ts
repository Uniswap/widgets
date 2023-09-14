import { ExplorerDataType, getExplorerLink } from './getExplorerLink'

describe('#getExplorerLink', () => {
  it('correct for tx', () => {
    expect(getExplorerLink(1, 'abc', ExplorerDataType.TRANSACTION)).toEqual('https://etherscan.io/tx/abc')
  })
  it('correct for token', () => {
    expect(getExplorerLink(1, 'abc', ExplorerDataType.TOKEN)).toEqual('https://etherscan.io/token/abc')
  })
  it('correct for address', () => {
    expect(getExplorerLink(1, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://etherscan.io/address/abc')
  })
  it('unrecognized chain id defaults to mainnet', () => {
    expect(getExplorerLink(2, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://etherscan.io/address/abc')
  })
  it('arbitrum', () => {
    expect(getExplorerLink(42161, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://arbiscan.io/address/abc')
  })
  it('polygon', () => {
    expect(getExplorerLink(137, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://polygonscan.com/address/abc')
  })
  it('mumbai', () => {
    expect(getExplorerLink(80001, 'abc', ExplorerDataType.ADDRESS)).toEqual(
      'https://mumbai.polygonscan.com/address/abc'
    )
  })
  it('celo', () => {
    expect(getExplorerLink(42220, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://celoscan.io/address/abc')
  })
  it('alfajores', () => {
    expect(getExplorerLink(44787, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://alfajores.celoscan.io/address/abc')
  })
  it('ropsten', () => {
    expect(getExplorerLink(3, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://ropsten.etherscan.io/address/abc')
  })
  it('enum', () => {
    expect(getExplorerLink(4, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://rinkeby.etherscan.io/address/abc')
  })
  it('bnb chain', () => {
    expect(getExplorerLink(56, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://bscscan.com/address/abc')
  })
  it('base', () => {
    expect(getExplorerLink(8453, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://basescan.org/address/abc')
  })
  it('base goerli', () => {
    expect(getExplorerLink(84531, 'abc', ExplorerDataType.ADDRESS)).toEqual('https://goerli.basescan.org/address/abc')
  })
})
