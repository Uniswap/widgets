'use strict';

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var sdkCore = require('@uniswap/sdk-core');
var smartOrderRouter = require('@uniswap/smart-order-router');
var index = require('./index-2fb47fe0.cjs');
var JSBI = require('jsbi');
var routerSdk = require('@uniswap/router-sdk');
require('react');
require('buffer');
require('@babel/runtime/helpers/slicedToArray');
require('styled-components');
require('@babel/runtime/helpers/taggedTemplateLiteral');
require('react-feather');
require('polished');
require('wcag-contrast');
require('@babel/runtime/helpers/extends');
require('rebass');
require('@web3-react/core');
require('@babel/runtime/helpers/objectWithoutProperties');
require('@uniswap/universal-router-sdk');
require('@reduxjs/toolkit/query/react');
require('jotai/immer');
require('jotai/utils');
require('@babel/runtime/helpers/classCallCheck');
require('@babel/runtime/helpers/createClass');
require('@babel/runtime/helpers/inherits');
require('@babel/runtime/helpers/possibleConstructorReturn');
require('@babel/runtime/helpers/getPrototypeOf');
require('tiny-invariant');
require('@ethersproject/units');
require('@reduxjs/toolkit');
require('jotai');
require('@uniswap/v2-sdk');
require('@uniswap/v3-sdk');
require('@babel/runtime/helpers/typeof');
require('@babel/runtime/helpers/get');
require('@babel/runtime/helpers/assertThisInitialized');
require('@babel/runtime/helpers/wrapNativeSuper');
require('qs');
require('@ethersproject/abi');
require('@uniswap/redux-multicall');
require('@ethersproject/address');
require('@ethersproject/constants');
require('@ethersproject/contracts');
require('@uniswap/permit2-sdk');
require('@ethersproject/hash');
require('@babel/runtime/helpers/toConsumableArray');
require('ethers/lib/utils');
require('@ethersproject/bytes');
require('@ethersproject/bignumber');
require('@ethersproject/strings');
require('popper-max-size-modifier');
require('react-dom');
require('react-popper');
require('cids');
require('multicodec');
require('multihashes');
require('wicg-inert');
require('node-vibrant/lib/bundle.js');
require('setimmediate');
require('react-virtualized-auto-sizer');
require('react-window');
require('@web3-react/walletconnect');
require('qrcode');
require('@ethersproject/web');
require('@ethersproject/providers');
require('@web3-react/eip1193');
require('@web3-react/metamask');
require('@web3-react/network');
require('@web3-react/types');
require('make-plural/plurals');
require('react-redux');
require('redux');
require('resize-observer-polyfill');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);
var JSBI__default = /*#__PURE__*/_interopDefaultLegacy(JSBI);

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function transformSwapRouteToGetQuoteResult(_ref) {
  var quote = _ref.quote,
      quoteGasAdjusted = _ref.quoteGasAdjusted,
      route = _ref.route,
      routeString = _ref.routeString,
      estimatedGasUsed = _ref.estimatedGasUsed,
      estimatedGasUsedQuoteToken = _ref.estimatedGasUsedQuoteToken,
      estimatedGasUsedUSD = _ref.estimatedGasUsedUSD,
      gasPriceWei = _ref.gasPriceWei,
      methodParameters = _ref.methodParameters,
      blockNumber = _ref.blockNumber,
      _ref$trade = _ref.trade,
      tradeType = _ref$trade.tradeType,
      inputAmount = _ref$trade.inputAmount,
      outputAmount = _ref$trade.outputAmount;
  var routeResponse = [];

  var _iterator = _createForOfIteratorHelper(route),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var subRoute = _step.value;
      var _amount = subRoute.amount,
          _quote = subRoute.quote,
          tokenPath = subRoute.tokenPath;

      if (subRoute.protocol === routerSdk.Protocol.V3) {
        var pools = subRoute.route.pools;
        var curRoute = [];

        for (var i = 0; i < pools.length; i++) {
          var nextPool = pools[i];
          var tokenIn = tokenPath[i];
          var tokenOut = tokenPath[i + 1];
          var edgeAmountIn = undefined;

          if (i === 0) {
            edgeAmountIn = index.isExactInput(tradeType) ? _amount.quotient.toString() : _quote.quotient.toString();
          }

          var edgeAmountOut = undefined;

          if (i === pools.length - 1) {
            edgeAmountOut = index.isExactInput(tradeType) ? _quote.quotient.toString() : _amount.quotient.toString();
          }

          curRoute.push({
            type: 'v3-pool',
            tokenIn: {
              chainId: tokenIn.chainId,
              decimals: tokenIn.decimals,
              address: tokenIn.address,
              symbol: tokenIn.symbol
            },
            tokenOut: {
              chainId: tokenOut.chainId,
              decimals: tokenOut.decimals,
              address: tokenOut.address,
              symbol: tokenOut.symbol
            },
            fee: nextPool.fee.toString(),
            liquidity: nextPool.liquidity.toString(),
            sqrtRatioX96: nextPool.sqrtRatioX96.toString(),
            tickCurrent: nextPool.tickCurrent.toString(),
            amountIn: edgeAmountIn,
            amountOut: edgeAmountOut
          });
        }

        routeResponse.push(curRoute);
      } else if (subRoute.protocol === routerSdk.Protocol.V2) {
        var _pools = subRoute.route.pairs;
        var _curRoute = [];

        for (var _i = 0; _i < _pools.length; _i++) {
          var _nextPool = _pools[_i];
          var _tokenIn = tokenPath[_i];
          var _tokenOut = tokenPath[_i + 1];
          var _edgeAmountIn = undefined;

          if (_i === 0) {
            _edgeAmountIn = index.isExactInput(tradeType) ? _amount.quotient.toString() : _quote.quotient.toString();
          }

          var _edgeAmountOut = undefined;

          if (_i === _pools.length - 1) {
            _edgeAmountOut = index.isExactInput(tradeType) ? _quote.quotient.toString() : _amount.quotient.toString();
          }

          var reserve0 = _nextPool.reserve0;
          var reserve1 = _nextPool.reserve1;

          _curRoute.push({
            type: 'v2-pool',
            tokenIn: {
              chainId: _tokenIn.chainId,
              decimals: _tokenIn.decimals,
              address: _tokenIn.address,
              symbol: _tokenIn.symbol
            },
            tokenOut: {
              chainId: _tokenOut.chainId,
              decimals: _tokenOut.decimals,
              address: _tokenOut.address,
              symbol: _tokenOut.symbol
            },
            reserve0: {
              token: {
                chainId: reserve0.currency.wrapped.chainId,
                decimals: reserve0.currency.wrapped.decimals,
                address: reserve0.currency.wrapped.address,
                symbol: reserve0.currency.wrapped.symbol
              },
              quotient: reserve0.quotient.toString()
            },
            reserve1: {
              token: {
                chainId: reserve1.currency.wrapped.chainId,
                decimals: reserve1.currency.wrapped.decimals,
                address: reserve1.currency.wrapped.address,
                symbol: reserve1.currency.wrapped.symbol
              },
              quotient: reserve1.quotient.toString()
            },
            amountIn: _edgeAmountIn,
            amountOut: _edgeAmountOut
          });
        }

        routeResponse.push(_curRoute);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var amount = index.isExactInput(tradeType) ? inputAmount : outputAmount;
  return {
    state: index.QuoteState.SUCCESS,
    data: {
      methodParameters: methodParameters,
      blockNumber: blockNumber.toString(),
      amount: amount.quotient.toString(),
      amountDecimals: amount.toExact(),
      quote: quote.quotient.toString(),
      quoteDecimals: quote.toExact(),
      quoteGasAdjusted: quoteGasAdjusted.quotient.toString(),
      quoteGasAdjustedDecimals: quoteGasAdjusted.toExact(),
      gasUseEstimateQuote: estimatedGasUsedQuoteToken.quotient.toString(),
      gasUseEstimateQuoteDecimals: estimatedGasUsedQuoteToken.toExact(),
      gasUseEstimate: estimatedGasUsed.toString(),
      gasUseEstimateUSD: estimatedGasUsedUSD.toExact(),
      gasPriceWei: gasPriceWei.toString(),
      route: routeResponse,
      routeString: routeString
    }
  };
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var AUTO_ROUTER_SUPPORTED_CHAINS = Object.values(smartOrderRouter.ChainId).filter(function (chainId) {
  return Number.isInteger(chainId);
});

function isAutoRouterSupportedChain(chainId) {
  return Boolean(chainId && AUTO_ROUTER_SUPPORTED_CHAINS.includes(chainId));
}
/** A cache of AlphaRouters, which must be initialized to a specific chain/provider. */


var routersCache = new WeakMap();

function getRouter(chainId, provider) {
  var routers = routersCache.get(provider) || {};
  var cached = routers[chainId];
  if (cached) return cached; // V2 is unsupported for chains other than mainnet.
  // TODO(zzmp): Upstream to @uniswap/smart-order-router, exporting an enum of supported v2 chains for clarity.

  var v2SubgraphProvider;

  if (chainId !== smartOrderRouter.ChainId.MAINNET) {
    v2SubgraphProvider = new smartOrderRouter.StaticV2SubgraphProvider(chainId);
  } // V3 computes on-chain, so the quoter must have gas limits appropriate to the provider.
  // Most defaults are fine, but polygon needs a lower gas limit.
  // TODO(zzmp): Upstream to @uniswap/smart-order-router, possibly making this easier to modify
  // (eg allowing configuration without an instance to avoid duplicating multicall2Provider).


  var onChainQuoteProvider;
  var multicall2Provider;

  if ([smartOrderRouter.ChainId.POLYGON, smartOrderRouter.ChainId.POLYGON_MUMBAI].includes(chainId)) {
    multicall2Provider = new smartOrderRouter.UniswapMulticallProvider(chainId, provider, 375000); // See https://github.com/Uniswap/smart-order-router/blob/98c58bdee9981fd9ffac9e7d7a97b18302d5f77a/src/routers/alpha-router/alpha-router.ts#L464-L487

    onChainQuoteProvider = new smartOrderRouter.OnChainQuoteProvider(chainId, provider, multicall2Provider, {
      retries: 2,
      minTimeout: 100,
      maxTimeout: 1000
    }, {
      multicallChunk: 10,
      gasLimitPerCall: 5000000,
      quoteMinSuccessRate: 0.1
    }, {
      gasLimitOverride: 5000000,
      multicallChunk: 5
    }, {
      gasLimitOverride: 6250000,
      multicallChunk: 4
    });
  }

  var router = new smartOrderRouter.AlphaRouter({
    chainId: chainId,
    provider: provider,
    v2SubgraphProvider: v2SubgraphProvider,
    multicall2Provider: multicall2Provider,
    onChainQuoteProvider: onChainQuoteProvider
  });
  routers[chainId] = router;
  routersCache.set(provider, routers);
  return router;
}

function getQuoteResult(_x, _x2, _x3) {
  return _getQuoteResult.apply(this, arguments);
}

function _getQuoteResult() {
  _getQuoteResult = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(_ref, router, routerConfig) {
    var tradeType, tokenIn, tokenOut, amountRaw, tokenInIsNative, tokenOutIsNative, currencyIn, currencyOut, baseCurrency, quoteCurrency, amount, route;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            tradeType = _ref.tradeType, tokenIn = _ref.tokenIn, tokenOut = _ref.tokenOut, amountRaw = _ref.amount;
            tokenInIsNative = Object.values(index.SwapRouterNativeAssets).includes(tokenIn.address);
            tokenOutIsNative = Object.values(index.SwapRouterNativeAssets).includes(tokenOut.address);
            currencyIn = tokenInIsNative ? index.nativeOnChain(tokenIn.chainId) : new sdkCore.Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol);
            currencyOut = tokenOutIsNative ? index.nativeOnChain(tokenOut.chainId) : new sdkCore.Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol);
            baseCurrency = index.isExactInput(tradeType) ? currencyIn : currencyOut;
            quoteCurrency = index.isExactInput(tradeType) ? currencyOut : currencyIn;
            amount = sdkCore.CurrencyAmount.fromRawAmount(baseCurrency, JSBI__default["default"].BigInt(amountRaw !== null && amountRaw !== void 0 ? amountRaw : '1')); // a null amountRaw should initialize the route

            _context.next = 10;
            return router.route(amount, quoteCurrency, tradeType,
            /*swapConfig=*/
            undefined, routerConfig);

          case 10:
            route = _context.sent;

            if (amountRaw) {
              _context.next = 13;
              break;
            }

            return _context.abrupt("return", {
              state: index.QuoteState.INITIALIZED
            });

          case 13:
            if (route) {
              _context.next = 15;
              break;
            }

            return _context.abrupt("return", {
              state: index.QuoteState.NOT_FOUND
            });

          case 15:
            return _context.abrupt("return", transformSwapRouteToGetQuoteResult(_objectSpread(_objectSpread({}, route), {}, {
              routeString: smartOrderRouter.routeAmountsToString(route.route)
            })));

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getQuoteResult.apply(this, arguments);
}

function getClientSideQuoteResult(_x4, _x5) {
  return _getClientSideQuoteResult.apply(this, arguments);
}

function _getClientSideQuoteResult() {
  _getClientSideQuoteResult = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(_ref2, routerConfig) {
    var tokenInAddress, tokenInChainId, tokenInDecimals, tokenInSymbol, tokenOutAddress, tokenOutChainId, tokenOutDecimals, tokenOutSymbol, amount, tradeType, provider, router;
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            tokenInAddress = _ref2.tokenInAddress, tokenInChainId = _ref2.tokenInChainId, tokenInDecimals = _ref2.tokenInDecimals, tokenInSymbol = _ref2.tokenInSymbol, tokenOutAddress = _ref2.tokenOutAddress, tokenOutChainId = _ref2.tokenOutChainId, tokenOutDecimals = _ref2.tokenOutDecimals, tokenOutSymbol = _ref2.tokenOutSymbol, amount = _ref2.amount, tradeType = _ref2.tradeType, provider = _ref2.provider;

            if (isAutoRouterSupportedChain(tokenInChainId)) {
              _context2.next = 3;
              break;
            }

            throw new Error("Router does not support this token's chain (chainId: ".concat(tokenInChainId, ")."));

          case 3:
            router = getRouter(tokenInChainId, provider);
            return _context2.abrupt("return", getQuoteResult({
              tradeType: tradeType,
              tokenIn: {
                address: tokenInAddress,
                chainId: tokenInChainId,
                decimals: tokenInDecimals,
                symbol: tokenInSymbol
              },
              tokenOut: {
                address: tokenOutAddress,
                chainId: tokenOutChainId,
                decimals: tokenOutDecimals,
                symbol: tokenOutSymbol
              },
              amount: amount
            }, router, routerConfig));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getClientSideQuoteResult.apply(this, arguments);
}

exports.getClientSideQuoteResult = getClientSideQuoteResult;
