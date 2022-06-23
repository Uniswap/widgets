import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core';
import { routeAmountsToString, ChainId, AlphaRouter } from '@uniswap/smart-order-router';
import JSBI from 'jsbi';
import { Protocol } from '@uniswap/router-sdk';

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// from routing-api (https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/quote.ts#L243-L311)
function transformSwapRouteToGetQuoteResult(type, amount, _ref) {
  var quote = _ref.quote,
      quoteGasAdjusted = _ref.quoteGasAdjusted,
      route = _ref.route,
      estimatedGasUsed = _ref.estimatedGasUsed,
      estimatedGasUsedQuoteToken = _ref.estimatedGasUsedQuoteToken,
      estimatedGasUsedUSD = _ref.estimatedGasUsedUSD,
      gasPriceWei = _ref.gasPriceWei,
      methodParameters = _ref.methodParameters,
      blockNumber = _ref.blockNumber;
  var routeResponse = [];

  var _iterator = _createForOfIteratorHelper(route),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var subRoute = _step.value;
      var _amount = subRoute.amount,
          _quote = subRoute.quote,
          tokenPath = subRoute.tokenPath;

      if (subRoute.protocol === Protocol.V3) {
        var pools = subRoute.route.pools;
        var curRoute = [];

        for (var i = 0; i < pools.length; i++) {
          var nextPool = pools[i];
          var tokenIn = tokenPath[i];
          var tokenOut = tokenPath[i + 1];
          var edgeAmountIn = undefined;

          if (i === 0) {
            edgeAmountIn = type === 'exactIn' ? _amount.quotient.toString() : _quote.quotient.toString();
          }

          var edgeAmountOut = undefined;

          if (i === pools.length - 1) {
            edgeAmountOut = type === 'exactIn' ? _quote.quotient.toString() : _amount.quotient.toString();
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
      } else if (subRoute.protocol === Protocol.V2) {
        var _pools = subRoute.route.pairs;
        var _curRoute = [];

        for (var _i = 0; _i < _pools.length; _i++) {
          var _nextPool = _pools[_i];
          var _tokenIn = tokenPath[_i];
          var _tokenOut = tokenPath[_i + 1];
          var _edgeAmountIn = undefined;

          if (_i === 0) {
            _edgeAmountIn = type === 'exactIn' ? _amount.quotient.toString() : _quote.quotient.toString();
          }

          var _edgeAmountOut = undefined;

          if (_i === _pools.length - 1) {
            _edgeAmountOut = type === 'exactIn' ? _quote.quotient.toString() : _amount.quotient.toString();
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

  var result = {
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
    routeString: routeAmountsToString(route)
  };
  return result;
}

var AUTO_ROUTER_SUPPORTED_CHAINS = Object.values(ChainId).filter(function (chainId) {
  return Number.isInteger(chainId);
});

function getQuote(_x, _x2, _x3) {
  return _getQuote.apply(this, arguments);
}

function _getQuote() {
  _getQuote = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref, routerParams, routerConfig) {
    var type, tokenIn, tokenOut, amountRaw, router, currencyIn, currencyOut, baseCurrency, quoteCurrency, amount, swapRoute;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            type = _ref.type, tokenIn = _ref.tokenIn, tokenOut = _ref.tokenOut, amountRaw = _ref.amount;
            router = new AlphaRouter(routerParams);
            currencyIn = new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol);
            currencyOut = new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol);
            baseCurrency = type === 'exactIn' ? currencyIn : currencyOut;
            quoteCurrency = type === 'exactIn' ? currencyOut : currencyIn;
            amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw));
            _context.next = 9;
            return router.route(amount, quoteCurrency, type === 'exactIn' ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
            /*swapConfig=*/
            undefined, routerConfig);

          case 9:
            swapRoute = _context.sent;

            if (swapRoute) {
              _context.next = 12;
              break;
            }

            throw new Error('Failed to generate client side quote');

          case 12:
            return _context.abrupt("return", {
              data: transformSwapRouteToGetQuoteResult(type, amount, swapRoute)
            });

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getQuote.apply(this, arguments);
}

function getClientSideQuote(_x4, _x5, _x6) {
  return _getClientSideQuote.apply(this, arguments);
}

function _getClientSideQuote() {
  _getClientSideQuote = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref2, routerParams, routerConfig) {
    var tokenInAddress, tokenInChainId, tokenInDecimals, tokenInSymbol, tokenOutAddress, tokenOutChainId, tokenOutDecimals, tokenOutSymbol, amount, type;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            tokenInAddress = _ref2.tokenInAddress, tokenInChainId = _ref2.tokenInChainId, tokenInDecimals = _ref2.tokenInDecimals, tokenInSymbol = _ref2.tokenInSymbol, tokenOutAddress = _ref2.tokenOutAddress, tokenOutChainId = _ref2.tokenOutChainId, tokenOutDecimals = _ref2.tokenOutDecimals, tokenOutSymbol = _ref2.tokenOutSymbol, amount = _ref2.amount, type = _ref2.type;
            return _context2.abrupt("return", getQuote({
              type: type,
              chainId: tokenInChainId,
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
            }, routerParams, routerConfig));

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getClientSideQuote.apply(this, arguments);
}

export { AUTO_ROUTER_SUPPORTED_CHAINS, getClientSideQuote };
//# sourceMappingURL=clientSideSmartOrderRouter-47a0fe84.js.map
