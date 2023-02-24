# 🕹 Wido Widget

[![npm](https://img.shields.io/npm/v/wido-widget)](https://www.npmjs.com/package/wido-widget)
<!-- [![Unit tests](https://github.com/Uniswap/interface/actions/workflows/test.yaml/badge.svg)](https://github.com/Uniswap/interface/actions/workflows/test.yaml) -->
<!-- [![Integration tests](https://github.com/Uniswap/interface/actions/workflows/e2e.yaml/badge.svg)](https://github.com/Uniswap/interface/actions/workflows/e2e.yaml) -->
<!-- [![Lint](https://github.com/Uniswap/interface/actions/workflows/lint.yml/badge.svg)](https://github.com/Uniswap/interface/actions/workflows/lint.yml) -->
<!-- [![Crowdin](https://badges.crowdin.net/uniswap-interface/localized.svg)](https://crowdin.com/project/uniswap-interface) -->

Wido Widget combines ease of use with great UX. Protocols integrate Wido Widget to accept deposits in any token, from any chain, in a single transaction.

Example use cases supported by Wido Widget:

* Single token deposits into LP pools, with any token, from any chain (Zaps)
* Deposit any token into any farm or vault (works cross-chain)
* Deposit any token from Ethereum into Starknet, including pools, farms or vaults on Starknet (bridge + deposit)
* Deposit any token from Ethereum into ZK Sync, including pools, farms or vaults on Starknet (bridge + deposit)

<figure><img src="https://1709844881-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4AaJqYK7Ftrytj6lOYPa%2Fuploads%2F5XYpcZkADyIWHTaXT7eH%2FScreenshot%202023-02-21%20at%2015.44.29.png?alt=media&token=b2216672-677e-47cb-83c0-f03e5c3a31ee" alt="widget screenshot"><figcaption><p>Wido Widget: Deposit ETH from Ethereum into a JediSwap LP pool on Starknet. All in a single transaction.</p></figcaption></figure>

## Getting started

Integrating Wido Widget only takes few lines of code.

First install the `wido-widget` [npm package](https://www.npmjs.com/package/wido-widget) which contains React components used to integrate Wido's zap functionality in a small and configurable user interface element.
You can customize the theme (colors, fonts, border radius, and more) to match the style of your application.

Install the widget via `npm` or `yarn`.

```js
yarn add wido-widget react-redux
```

```js
npm i --save wido-widget react-redux
```

After installing, embed the React component in your application.

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { SwapWidget } from 'wido-widget'

function App() {
  return (
    <SwapWidget
      onConnectWalletClick={handleConnectWalletClick}
      ethProvider={ethersjsInstance}
      snAccount={starknetjsInstance}
      // optional params
      theme={theme}
      onTxSubmit={handleTxSubmit}
      onTxSuccess={handleTxSuccess}
      onTxFail={handleTxFail}
    />
  )
}

ReactDOM.render(
  <App />,
  document.getElementById("my-app")
)
```

You are expected to handle the `onConnectWalletClick` callback by integrating with `@web3-react/core`, `@web3-onboard/core` or any other way of managing the wallet connection and then pass a `Web3Provider` instance that comes from the `ethers.js`.
When integrating the Starknet network, you are also expected to pass in the `Account` instance that you created with `starknet.js`.

## Documentation

* [Guide](https://docs.joinwido.com/integrate-wido/widget)
* [API Reference](https://unpkg.com/wido-widget@latest/docs/index.html)
