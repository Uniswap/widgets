const mainnetFork = {
  url: 'https://eth-mainnet.alchemyapi.io/v2/lhVWQ3rY2i5_OZtYkU4Lzg_OsDT97Eoz',
  blockNumber: 13582625,
}

module.exports = {
  networks: {
    hardhat: {
      chainId: 1,
      forking: mainnetFork,
    },
  },
}
