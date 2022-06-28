'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var React = require('react');
var sdkCore = require('@uniswap/sdk-core');
var providers = require('@ethersproject/providers');
var core = require('@web3-react/core');
var eip1193 = require('@web3-react/eip1193');
var empty = require('@web3-react/empty');
var url = require('@web3-react/url');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _inherits = require('@babel/runtime/helpers/inherits');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var types = require('@web3-react/types');
var abi$4 = require('@ethersproject/abi');
var invariant = require('tiny-invariant');
var v2Sdk = require('@uniswap/v2-sdk');
var v3Sdk = require('@uniswap/v3-sdk');
var reduxMulticall = require('@uniswap/redux-multicall');
var address = require('@ethersproject/address');
var constants = require('@ethersproject/constants');
var contracts = require('@ethersproject/contracts');
var redux = require('redux');
var JSBI = require('jsbi');
var hash = require('@ethersproject/hash');
var units = require('@ethersproject/units');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var routerSdk = require('@uniswap/router-sdk');
var utils = require('jotai/utils');
var jotai = require('jotai');
var immer = require('jotai/immer');
require('setimmediate');
var _typeof = require('@babel/runtime/helpers/typeof');
var bytes = require('@ethersproject/bytes');
var strings = require('@ethersproject/strings');
var CID = require('cids');
var multicodec = require('multicodec');
var multihashes = require('multihashes');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var reactRedux = require('react-redux');
var _styled = require('styled-components');
require('wicg-inert');
var _taggedTemplateLiteral = require('@babel/runtime/helpers/taggedTemplateLiteral');
var reactFeather = require('react-feather');
var reactDom = require('react-dom');
var polished = require('polished');
require('wcag-contrast');
var _extends$3 = require('@babel/runtime/helpers/extends');
var rebass = require('rebass');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);
var invariant__default = /*#__PURE__*/_interopDefaultLegacy(invariant);
var JSBI__default = /*#__PURE__*/_interopDefaultLegacy(JSBI);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var CID__default = /*#__PURE__*/_interopDefaultLegacy(CID);
var _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultLegacy(_wrapNativeSuper);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var _taggedTemplateLiteral__default = /*#__PURE__*/_interopDefaultLegacy(_taggedTemplateLiteral);
var _extends__default = /*#__PURE__*/_interopDefaultLegacy(_extends$3);

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function parseChainId(chainId) {
  return Number.parseInt(chainId, 16);
}

var JsonRpcConnector = /*#__PURE__*/function (_Connector) {
  _inherits__default["default"](JsonRpcConnector, _Connector);

  var _super = _createSuper$5(JsonRpcConnector);

  function JsonRpcConnector(actions, customProvider) {
    var _this;

    _classCallCheck__default["default"](this, JsonRpcConnector);

    _this = _super.call(this, actions);
    _this.customProvider = customProvider;
    customProvider.on('connect', function (_ref) {
      var chainId = _ref.chainId;

      _this.actions.update({
        chainId: parseChainId(chainId)
      });
    }).on('disconnect', function (error) {
      _this.actions.reportError(error);
    }).on('chainChanged', function (chainId) {
      _this.actions.update({
        chainId: parseChainId(chainId)
      });
    }).on('accountsChanged', function (accounts) {
      _this.actions.update({
        accounts: accounts
      });
    });
    return _this;
  }

  _createClass__default["default"](JsonRpcConnector, [{
    key: "activate",
    value: function () {
      var _activate = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
        var _yield$Promise$all, _yield$Promise$all2, chainId, accounts;

        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.actions.startActivation();
                _context.prev = 1;
                _context.next = 4;
                return Promise.all([this.customProvider.getNetwork(), this.customProvider.listAccounts()]);

              case 4:
                _yield$Promise$all = _context.sent;
                _yield$Promise$all2 = _slicedToArray__default["default"](_yield$Promise$all, 2);
                chainId = _yield$Promise$all2[0].chainId;
                accounts = _yield$Promise$all2[1];
                this.actions.update({
                  chainId: chainId,
                  accounts: accounts
                });
                _context.next = 14;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](1);
                this.actions.reportError(_context.t0);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 11]]);
      }));

      function activate() {
        return _activate.apply(this, arguments);
      }

      return activate;
    }()
  }]);

  return JsonRpcConnector;
}(types.Connector);

var _initializeConnector = core.initializeConnector(function () {
  return empty.EMPTY;
}),
    _initializeConnector2 = _slicedToArray__default["default"](_initializeConnector, 2),
    EMPTY_CONNECTOR = _initializeConnector2[0],
    EMPTY_HOOKS = _initializeConnector2[1];

var EMPTY_STATE = {
  connector: EMPTY_CONNECTOR,
  hooks: EMPTY_HOOKS
};
var EMPTY_CONTEXT = {
  connector: empty.EMPTY
};
var Web3Context = /*#__PURE__*/React.createContext(EMPTY_CONTEXT);
function useActiveWeb3React() {
  return React.useContext(Web3Context);
}
function ActiveWeb3Provider(_ref) {
  var jsonRpcEndpoint = _ref.jsonRpcEndpoint,
      provider = _ref.provider,
      children = _ref.children,
      accounts = _ref.accounts;
  var network = React.useMemo(function () {
    if (jsonRpcEndpoint) {
      var _connector, _hooks;

      if (providers.JsonRpcProvider.isProvider(jsonRpcEndpoint)) {

        var _initializeConnector3 = core.initializeConnector(function (actions) {
          return new JsonRpcConnector(actions, jsonRpcEndpoint);
        });

        var _initializeConnector4 = _slicedToArray__default["default"](_initializeConnector3, 2);

        _connector = _initializeConnector4[0];
        _hooks = _initializeConnector4[1];
      } else {

        var _initializeConnector5 = core.initializeConnector(function (actions) {
          return new url.Url(actions, jsonRpcEndpoint);
        });

        var _initializeConnector6 = _slicedToArray__default["default"](_initializeConnector5, 2);

        _connector = _initializeConnector6[0];
        _hooks = _initializeConnector6[1];
      }

      _connector.activate();

      return {
        connector: _connector,
        hooks: _hooks
      };
    }

    return EMPTY_STATE;
  }, [jsonRpcEndpoint]);
  var wallet = React.useMemo(function () {
    if (provider) {
      var _connector2, _hooks2;

      if (providers.JsonRpcProvider.isProvider(provider)) {

        var _initializeConnector7 = core.initializeConnector(function (actions) {
          return new JsonRpcConnector(actions, provider);
        });

        var _initializeConnector8 = _slicedToArray__default["default"](_initializeConnector7, 2);

        _connector2 = _initializeConnector8[0];
        _hooks2 = _initializeConnector8[1];
      } else if (providers.JsonRpcProvider.isProvider(provider.provider)) {
        throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly');
      } else {

        var _initializeConnector9 = core.initializeConnector(function (actions) {
          return new eip1193.EIP1193(actions, provider);
        });

        var _initializeConnector10 = _slicedToArray__default["default"](_initializeConnector9, 2);

        _connector2 = _initializeConnector10[0];
        _hooks2 = _initializeConnector10[1];
      }

      _connector2.activate();

      return {
        connector: _connector2,
        hooks: _hooks2
      };
    }

    return EMPTY_STATE;
  }, [provider]);

  var _ref2 = wallet.hooks.useIsActive() || network === EMPTY_STATE ? wallet : network,
      connector = _ref2.connector,
      hooks = _ref2.hooks;

  var account = accounts[0];
  var activating = hooks.useIsActivating();
  var active = hooks.useIsActive();
  var chainId = hooks.useChainId();
  var error = hooks.useError();
  var library = hooks.useProvider();
  var web3 = React.useMemo(function () {
    if (connector === empty.EMPTY || !(active || activating)) {
      return EMPTY_CONTEXT;
    }

    return {
      connector: connector,
      library: library,
      chainId: chainId,
      accounts: accounts,
      account: account,
      active: active,
      activating: activating,
      error: error
    };
  }, [account, accounts, activating, active, chainId, connector, error, library]); // Log web3 errors to facilitate debugging.

  React.useEffect(function () {
    if (error) {
      console.error('web3 error:', error);
    }
  }, [error]);
  return /*#__PURE__*/React__default["default"].createElement(Web3Context.Provider, {
    value: web3
  }, children);
}

var ERC20ABI = [
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_spender",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_from",
				type: "address"
			},
			{
				name: "_to",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "balance",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_to",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address"
			},
			{
				name: "_spender",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		payable: true,
		stateMutability: "payable",
		type: "fallback"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	}
];

var _CHAIN_IDS_TO_NAMES;

/**
 * List of all the networks supported by the Uniswap Interface
 */
exports.SupportedChainId = void 0;

(function (SupportedChainId) {
  SupportedChainId[SupportedChainId["MAINNET"] = 1] = "MAINNET";
  SupportedChainId[SupportedChainId["ROPSTEN"] = 3] = "ROPSTEN";
  SupportedChainId[SupportedChainId["RINKEBY"] = 4] = "RINKEBY";
  SupportedChainId[SupportedChainId["GOERLI"] = 5] = "GOERLI";
  SupportedChainId[SupportedChainId["KOVAN"] = 42] = "KOVAN";
  SupportedChainId[SupportedChainId["ARBITRUM_ONE"] = 42161] = "ARBITRUM_ONE";
  SupportedChainId[SupportedChainId["ARBITRUM_RINKEBY"] = 421611] = "ARBITRUM_RINKEBY";
  SupportedChainId[SupportedChainId["OPTIMISM"] = 10] = "OPTIMISM";
  SupportedChainId[SupportedChainId["OPTIMISTIC_KOVAN"] = 69] = "OPTIMISTIC_KOVAN";
  SupportedChainId[SupportedChainId["POLYGON"] = 137] = "POLYGON";
  SupportedChainId[SupportedChainId["POLYGON_MUMBAI"] = 80001] = "POLYGON_MUMBAI";
})(exports.SupportedChainId || (exports.SupportedChainId = {}));

(_CHAIN_IDS_TO_NAMES = {}, _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.MAINNET, 'mainnet'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.ROPSTEN, 'ropsten'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.RINKEBY, 'rinkeby'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.GOERLI, 'goerli'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.KOVAN, 'kovan'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.POLYGON, 'polygon'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.POLYGON_MUMBAI, 'polygon_mumbai'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.ARBITRUM_ONE, 'arbitrum'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.ARBITRUM_RINKEBY, 'arbitrum_rinkeby'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.OPTIMISM, 'optimism'), _defineProperty__default["default"](_CHAIN_IDS_TO_NAMES, exports.SupportedChainId.OPTIMISTIC_KOVAN, 'optimistic_kovan'), _CHAIN_IDS_TO_NAMES);
/**
 * Array of all the supported chain IDs
 */

var ALL_SUPPORTED_CHAIN_IDS = Object.values(exports.SupportedChainId).filter(function (id) {
  return typeof id === 'number';
});
var SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [exports.SupportedChainId.MAINNET, exports.SupportedChainId.POLYGON, exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.ARBITRUM_ONE];
/**
 * All the chain IDs that are running the Ethereum protocol.
 */

[exports.SupportedChainId.MAINNET, exports.SupportedChainId.ROPSTEN, exports.SupportedChainId.RINKEBY, exports.SupportedChainId.GOERLI, exports.SupportedChainId.KOVAN, exports.SupportedChainId.POLYGON, exports.SupportedChainId.POLYGON_MUMBAI];

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
var L2_CHAIN_IDS = [exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN];

var DEFAULT_NETWORKS = [exports.SupportedChainId.MAINNET, exports.SupportedChainId.ROPSTEN, exports.SupportedChainId.RINKEBY, exports.SupportedChainId.GOERLI, exports.SupportedChainId.KOVAN];
function constructSameAddressMap(address) {
  var additionalNetworks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce(function (memo, chainId) {
    memo[chainId] = address;
    return memo;
  }, {});
}

var _objectSpread2$2, _ENS_REGISTRAR_ADDRES, _TICK_LENS_ADDRESSES;

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$9(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var UNI_ADDRESS = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984');
var MULTICALL_ADDRESS = _objectSpread$9(_objectSpread$9({}, constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.POLYGON_MUMBAI, exports.SupportedChainId.POLYGON])), {}, (_objectSpread2$2 = {}, _defineProperty__default["default"](_objectSpread2$2, exports.SupportedChainId.ARBITRUM_ONE, '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB'), _defineProperty__default["default"](_objectSpread2$2, exports.SupportedChainId.ARBITRUM_RINKEBY, '0xa501c031958F579dB7676fF1CE78AD305794d579'), _objectSpread2$2));
var V2_FACTORY_ADDRESSES = constructSameAddressMap(v2Sdk.FACTORY_ADDRESS);
constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
constructSameAddressMap('0xE592427A0AEce92De3Edee1F18E0157C05861564', [exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON, exports.SupportedChainId.POLYGON_MUMBAI]);
constructSameAddressMap('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', [exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON, exports.SupportedChainId.POLYGON_MUMBAI]);
/**
 * The oldest V0 governance address
 */

constructSameAddressMap('0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F');
/**
 * The older V1 governance address
 */

_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6');
/**
 * The latest governor bravo that is currently admin of timelock
 */

_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, '0x408ED6354d4973f66138C91495F2f2FCbd8724C3');
constructSameAddressMap('0x1a9C8182C09F50C8318d769245beA52c32BE35BC');
_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, '0x090D4613473dEE047c3f2706764f49E0821D256e');
_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8');
var V3_CORE_FACTORY_ADDRESSES = constructSameAddressMap(v3Sdk.FACTORY_ADDRESS, [exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON_MUMBAI, exports.SupportedChainId.POLYGON]);
var QUOTER_ADDRESSES = constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', [exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON_MUMBAI, exports.SupportedChainId.POLYGON]);
constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', [exports.SupportedChainId.OPTIMISM, exports.SupportedChainId.OPTIMISTIC_KOVAN, exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON_MUMBAI, exports.SupportedChainId.POLYGON]);
var ENS_REGISTRAR_ADDRESSES = (_ENS_REGISTRAR_ADDRES = {}, _defineProperty__default["default"](_ENS_REGISTRAR_ADDRES, exports.SupportedChainId.MAINNET, '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'), _defineProperty__default["default"](_ENS_REGISTRAR_ADDRES, exports.SupportedChainId.ROPSTEN, '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'), _defineProperty__default["default"](_ENS_REGISTRAR_ADDRES, exports.SupportedChainId.GOERLI, '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'), _defineProperty__default["default"](_ENS_REGISTRAR_ADDRES, exports.SupportedChainId.RINKEBY, '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'), _ENS_REGISTRAR_ADDRES);
_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, '0x65770b5283117639760beA3F867b69b3697a91dd');
constructSameAddressMap('0xA5644E29708357803b5A882D272c41cC0dF92B34', [exports.SupportedChainId.ARBITRUM_ONE, exports.SupportedChainId.ARBITRUM_RINKEBY, exports.SupportedChainId.POLYGON_MUMBAI, exports.SupportedChainId.POLYGON]);
(_TICK_LENS_ADDRESSES = {}, _defineProperty__default["default"](_TICK_LENS_ADDRESSES, exports.SupportedChainId.ARBITRUM_ONE, '0xbfd8137f7d1516D3ea5cA83523914859ec47F573'), _defineProperty__default["default"](_TICK_LENS_ADDRESSES, exports.SupportedChainId.ARBITRUM_RINKEBY, '0xbfd8137f7d1516D3ea5cA83523914859ec47F573'), _TICK_LENS_ADDRESSES);

var _USDC, _UNI, _objectSpread2$1, _USDC2;

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$8(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var USDC_MAINNET = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C');
var USDC_ROPSTEN = new sdkCore.Token(exports.SupportedChainId.ROPSTEN, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD//C');
var USDC_RINKEBY = new sdkCore.Token(exports.SupportedChainId.RINKEBY, '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', 6, 'tUSDC', 'test USD//C');
var USDC_GOERLI = new sdkCore.Token(exports.SupportedChainId.GOERLI, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD//C');
var USDC_KOVAN = new sdkCore.Token(exports.SupportedChainId.KOVAN, '0x31eeb2d0f9b6fd8642914ab10f4dd473677d80df', 6, 'USDC', 'USD//C');
var USDC_OPTIMISM = new sdkCore.Token(exports.SupportedChainId.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDC', 'USD//C');
var USDC_OPTIMISTIC_KOVAN = new sdkCore.Token(exports.SupportedChainId.OPTIMISTIC_KOVAN, '0x3b8e53b3ab8e01fb57d0c9e893bc4d655aa67d84', 6, 'USDC', 'USD//C');
var USDC_ARBITRUM = new sdkCore.Token(exports.SupportedChainId.ARBITRUM_ONE, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 'USDC', 'USD//C');
var USDC_ARBITRUM_RINKEBY = new sdkCore.Token(exports.SupportedChainId.ARBITRUM_RINKEBY, '0x09b98f8b2395d076514037ff7d39a091a536206c', 6, 'USDC', 'USD//C');
var USDC_POLYGON = new sdkCore.Token(exports.SupportedChainId.POLYGON, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 6, 'USDC', 'USD//C');
var USDC_POLYGON_MUMBAI = new sdkCore.Token(exports.SupportedChainId.POLYGON_MUMBAI, '0xe11a86849d99f524cac3e7a0ec1241828e332c62', 6, 'USDC', 'USD//C');
var AMPL = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth');
var DAI = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
var DAI_ARBITRUM_ONE = new sdkCore.Token(exports.SupportedChainId.ARBITRUM_ONE, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai stable coin');
var DAI_OPTIMISM = new sdkCore.Token(exports.SupportedChainId.OPTIMISM, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai stable coin');
(_USDC = {}, _defineProperty__default["default"](_USDC, exports.SupportedChainId.MAINNET, USDC_MAINNET), _defineProperty__default["default"](_USDC, exports.SupportedChainId.ARBITRUM_ONE, USDC_ARBITRUM), _defineProperty__default["default"](_USDC, exports.SupportedChainId.OPTIMISM, USDC_OPTIMISM), _defineProperty__default["default"](_USDC, exports.SupportedChainId.ARBITRUM_RINKEBY, USDC_ARBITRUM_RINKEBY), _defineProperty__default["default"](_USDC, exports.SupportedChainId.OPTIMISTIC_KOVAN, USDC_OPTIMISTIC_KOVAN), _defineProperty__default["default"](_USDC, exports.SupportedChainId.POLYGON, USDC_POLYGON), _defineProperty__default["default"](_USDC, exports.SupportedChainId.POLYGON_MUMBAI, USDC_POLYGON_MUMBAI), _defineProperty__default["default"](_USDC, exports.SupportedChainId.GOERLI, USDC_GOERLI), _defineProperty__default["default"](_USDC, exports.SupportedChainId.RINKEBY, USDC_RINKEBY), _defineProperty__default["default"](_USDC, exports.SupportedChainId.KOVAN, USDC_KOVAN), _defineProperty__default["default"](_USDC, exports.SupportedChainId.ROPSTEN, USDC_ROPSTEN), _USDC);
var DAI_POLYGON = new sdkCore.Token(exports.SupportedChainId.POLYGON, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin');
var USDT_POLYGON = new sdkCore.Token(exports.SupportedChainId.POLYGON, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT', 'Tether USD');
var WBTC_POLYGON = new sdkCore.Token(exports.SupportedChainId.POLYGON, '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', 8, 'WBTC', 'Wrapped BTC');
var USDT = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
var USDT_ARBITRUM_ONE = new sdkCore.Token(exports.SupportedChainId.ARBITRUM_ONE, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD');
var USDT_OPTIMISM = new sdkCore.Token(exports.SupportedChainId.OPTIMISM, '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 6, 'USDT', 'Tether USD');
var WBTC = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
var WBTC_ARBITRUM_ONE = new sdkCore.Token(exports.SupportedChainId.ARBITRUM_ONE, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 'WBTC', 'Wrapped BTC');
var WBTC_OPTIMISM = new sdkCore.Token(exports.SupportedChainId.OPTIMISM, '0x68f180fcCe6836688e9084f035309E29Bf0A2095', 8, 'WBTC', 'Wrapped BTC');
var FEI = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD');
var TRIBE = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B', 18, 'TRIBE', 'Tribe');
var FRAX = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x853d955aCEf822Db058eb8505911ED77F175b99e', 18, 'FRAX', 'Frax');
var FXS = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share');
var renBTC = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8, 'renBTC', 'renBTC');
var ETH2X_FLI = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD', 18, 'ETH2x-FLI', 'ETH 2x Flexible Leverage Index');
var sETH2 = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0xFe2e637202056d30016725477c5da089Ab0A043A', 18, 'sETH2', 'StakeWise Staked ETH2');
var rETH2 = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x20BC832ca081b91433ff6c17f85701B6e92486c5', 18, 'rETH2', 'StakeWise Reward ETH2');
var SWISE = new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x48C3399719B582dD63eB5AADf12A40B4C3f52FA2', 18, 'SWISE', 'StakeWise');
var WETH_POLYGON_MUMBAI = new sdkCore.Token(exports.SupportedChainId.POLYGON_MUMBAI, '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa', 18, 'WETH', 'Wrapped Ether');
var WETH_POLYGON = new sdkCore.Token(exports.SupportedChainId.POLYGON, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 18, 'WETH', 'Wrapped Ether');
(_UNI = {}, _defineProperty__default["default"](_UNI, exports.SupportedChainId.MAINNET, new sdkCore.Token(exports.SupportedChainId.MAINNET, UNI_ADDRESS[1], 18, 'UNI', 'Uniswap')), _defineProperty__default["default"](_UNI, exports.SupportedChainId.RINKEBY, new sdkCore.Token(exports.SupportedChainId.RINKEBY, UNI_ADDRESS[4], 18, 'UNI', 'Uniswap')), _defineProperty__default["default"](_UNI, exports.SupportedChainId.ROPSTEN, new sdkCore.Token(exports.SupportedChainId.ROPSTEN, UNI_ADDRESS[3], 18, 'UNI', 'Uniswap')), _defineProperty__default["default"](_UNI, exports.SupportedChainId.GOERLI, new sdkCore.Token(exports.SupportedChainId.GOERLI, UNI_ADDRESS[5], 18, 'UNI', 'Uniswap')), _defineProperty__default["default"](_UNI, exports.SupportedChainId.KOVAN, new sdkCore.Token(exports.SupportedChainId.KOVAN, UNI_ADDRESS[42], 18, 'UNI', 'Uniswap')), _UNI);
var WRAPPED_NATIVE_CURRENCY = _objectSpread$8(_objectSpread$8({}, sdkCore.WETH9), {}, (_objectSpread2$1 = {}, _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.OPTIMISM, new sdkCore.Token(exports.SupportedChainId.OPTIMISM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether')), _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.OPTIMISTIC_KOVAN, new sdkCore.Token(exports.SupportedChainId.OPTIMISTIC_KOVAN, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether')), _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.ARBITRUM_ONE, new sdkCore.Token(exports.SupportedChainId.ARBITRUM_ONE, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether')), _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.ARBITRUM_RINKEBY, new sdkCore.Token(exports.SupportedChainId.ARBITRUM_RINKEBY, '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681', 18, 'WETH', 'Wrapped Ether')), _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.POLYGON, new sdkCore.Token(exports.SupportedChainId.POLYGON, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'Wrapped MATIC')), _defineProperty__default["default"](_objectSpread2$1, exports.SupportedChainId.POLYGON_MUMBAI, new sdkCore.Token(exports.SupportedChainId.POLYGON_MUMBAI, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', 18, 'WMATIC', 'Wrapped MATIC')), _objectSpread2$1));

function isMatic(chainId) {
  return chainId === exports.SupportedChainId.POLYGON_MUMBAI || chainId === exports.SupportedChainId.POLYGON;
}

var MaticNativeCurrency = /*#__PURE__*/function (_NativeCurrency) {
  _inherits__default["default"](MaticNativeCurrency, _NativeCurrency);

  var _super = _createSuper$4(MaticNativeCurrency);

  function MaticNativeCurrency(chainId) {
    _classCallCheck__default["default"](this, MaticNativeCurrency);

    if (!isMatic(chainId)) throw new Error('Not matic');
    return _super.call(this, chainId, 18, 'MATIC', 'Polygon Matic');
  }

  _createClass__default["default"](MaticNativeCurrency, [{
    key: "equals",
    value: function equals(other) {
      return other.isNative && other.chainId === this.chainId;
    }
  }, {
    key: "wrapped",
    get: function get() {
      if (!isMatic(this.chainId)) throw new Error('Not matic');
      var wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
      invariant__default["default"](wrapped instanceof sdkCore.Token);
      return wrapped;
    }
  }]);

  return MaticNativeCurrency;
}(sdkCore.NativeCurrency);

var ExtendedEther = /*#__PURE__*/function (_Ether) {
  _inherits__default["default"](ExtendedEther, _Ether);

  var _super2 = _createSuper$4(ExtendedEther);

  function ExtendedEther() {
    _classCallCheck__default["default"](this, ExtendedEther);

    return _super2.apply(this, arguments);
  }

  _createClass__default["default"](ExtendedEther, [{
    key: "wrapped",
    get: function get() {
      var wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
      if (wrapped) return wrapped;
      throw new Error('Unsupported chain ID');
    }
  }], [{
    key: "onChain",
    value: function onChain(chainId) {
      var _this$_cachedExtended;

      return (_this$_cachedExtended = this._cachedExtendedEther[chainId]) !== null && _this$_cachedExtended !== void 0 ? _this$_cachedExtended : this._cachedExtendedEther[chainId] = new ExtendedEther(chainId);
    }
  }]);

  return ExtendedEther;
}(sdkCore.Ether);

_defineProperty__default["default"](ExtendedEther, "_cachedExtendedEther", {});

var cachedNativeCurrency = {};
function nativeOnChain(chainId) {
  var _cachedNativeCurrency;

  return (_cachedNativeCurrency = cachedNativeCurrency[chainId]) !== null && _cachedNativeCurrency !== void 0 ? _cachedNativeCurrency : cachedNativeCurrency[chainId] = isMatic(chainId) ? new MaticNativeCurrency(chainId) : ExtendedEther.onChain(chainId);
}
({
  USDC: (_USDC2 = {}, _defineProperty__default["default"](_USDC2, exports.SupportedChainId.MAINNET, USDC_MAINNET.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.ARBITRUM_ONE, USDC_ARBITRUM.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.OPTIMISM, USDC_OPTIMISM.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.ARBITRUM_RINKEBY, USDC_ARBITRUM_RINKEBY.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.OPTIMISTIC_KOVAN, USDC_OPTIMISTIC_KOVAN.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.POLYGON, USDC_POLYGON.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.POLYGON_MUMBAI, USDC_POLYGON_MUMBAI.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.GOERLI, USDC_GOERLI.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.RINKEBY, USDC_RINKEBY.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.KOVAN, USDC_KOVAN.address), _defineProperty__default["default"](_USDC2, exports.SupportedChainId.ROPSTEN, USDC_ROPSTEN.address), _USDC2)
});

function isVisibilityStateSupported() {
  return 'visibilityState' in document;
}

function isWindowVisible() {
  return !isVisibilityStateSupported() || document.visibilityState !== 'hidden';
}
/**
 * Returns whether the window is currently visible to the user.
 */


function useIsWindowVisible() {
  var _useState = React.useState(false),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      focused = _useState2[0],
      setFocused = _useState2[1];

  var listener = React.useCallback(function () {
    setFocused(isWindowVisible());
  }, [setFocused]);
  React.useEffect(function () {
    if (!isVisibilityStateSupported()) return undefined;
    setFocused(function (focused) {
      return isWindowVisible();
    });
    document.addEventListener('visibilitychange', listener);
    return function () {
      document.removeEventListener('visibilitychange', listener);
    };
  }, [listener]);
  return focused;
}

var MISSING_PROVIDER$1 = Symbol();
var BlockNumberContext = /*#__PURE__*/React.createContext(MISSING_PROVIDER$1);

function useBlockNumberContext() {
  var blockNumber = React.useContext(BlockNumberContext);

  if (blockNumber === MISSING_PROVIDER$1) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>');
  }

  return blockNumber;
}
/** Requires that BlockUpdater be installed in the DOM tree. */


function useBlockNumber() {
  return useBlockNumberContext().value;
}
function useFastForwardBlockNumber() {
  return useBlockNumberContext().fastForward;
}
function BlockNumberProvider(_ref) {
  var children = _ref.children;

  var _useActiveWeb3React = useActiveWeb3React(),
      activeChainId = _useActiveWeb3React.chainId,
      library = _useActiveWeb3React.library;

  var _useState = React.useState({
    chainId: activeChainId
  }),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      _useState2$ = _useState2[0],
      chainId = _useState2$.chainId,
      block = _useState2$.block,
      setChainBlock = _useState2[1];

  var onBlock = React.useCallback(function (block) {
    setChainBlock(function (chainBlock) {
      if (chainBlock.chainId === activeChainId) {
        if (!chainBlock.block || chainBlock.block < block) {
          return {
            chainId: activeChainId,
            block: block
          };
        }
      }

      return chainBlock;
    });
  }, [activeChainId, setChainBlock]);
  var windowVisible = useIsWindowVisible();
  React.useEffect(function () {
    if (library && activeChainId && windowVisible) {
      // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
      setChainBlock(function (chainBlock) {
        return chainBlock.chainId === activeChainId ? chainBlock : {
          chainId: activeChainId
        };
      });
      var stale = false;
      library.getBlockNumber().then(function (block) {
        if (stale) return;
        onBlock(block);
      }).catch(function (error) {
        console.error("Failed to get block number for chainId ".concat(activeChainId), error);
      });
      library.on('block', onBlock);
      return function () {
        stale = true;
        library.off('block', onBlock);
      };
    }

    return undefined;
  }, [activeChainId, library, onBlock, setChainBlock, windowVisible]);
  var value = React.useMemo(function () {
    return {
      value: chainId === activeChainId ? block : undefined,
      fastForward: function fastForward(block) {
        return setChainBlock({
          chainId: activeChainId,
          block: block
        });
      }
    };
  }, [activeChainId, block, chainId]);
  return /*#__PURE__*/React__default["default"].createElement(BlockNumberContext.Provider, {
    value: value
  }, children);
}

var abi$3 = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Burn",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "Mint",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Swap",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve0",
				type: "uint112"
			},
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve1",
				type: "uint112"
			}
		],
		name: "Sync",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		constant: true,
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "MINIMUM_LIQUIDITY",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "PERMIT_TYPEHASH",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "burn",
		outputs: [
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getReserves",
		outputs: [
			{
				internalType: "uint112",
				name: "reserve0",
				type: "uint112"
			},
			{
				internalType: "uint112",
				name: "reserve1",
				type: "uint112"
			},
			{
				internalType: "uint32",
				name: "blockTimestampLast",
				type: "uint32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "initialize",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "kLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "permit",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "price0CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "price1CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "skim",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "swap",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: false,
		inputs: [
		],
		name: "sync",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "token0",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "token1",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	}
];

var _format$1 = "hh-sol-artifact-1";
var contractName$1 = "Quoter";
var sourceName$1 = "contracts/lens/Quoter.sol";
var abi$2 = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_factory",
				type: "address"
			},
			{
				internalType: "address",
				name: "_WETH9",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
		],
		name: "WETH9",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "path",
				type: "bytes"
			},
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		name: "quoteExactInput",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			},
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint160",
				name: "sqrtPriceLimitX96",
				type: "uint160"
			}
		],
		name: "quoteExactInputSingle",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "path",
				type: "bytes"
			},
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		name: "quoteExactOutput",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			},
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint160",
				name: "sqrtPriceLimitX96",
				type: "uint160"
			}
		],
		name: "quoteExactOutputSingle",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "int256",
				name: "amount0Delta",
				type: "int256"
			},
			{
				internalType: "int256",
				name: "amount1Delta",
				type: "int256"
			},
			{
				internalType: "bytes",
				name: "path",
				type: "bytes"
			}
		],
		name: "uniswapV3SwapCallback",
		outputs: [
		],
		stateMutability: "view",
		type: "function"
	}
];
var bytecode$1 = "0x60c060405234801561001057600080fd5b506040516112e53803806112e583398101604081905261002f91610069565b6001600160601b0319606092831b8116608052911b1660a05261009b565b80516001600160a01b038116811461006457600080fd5b919050565b6000806040838503121561007b578182fd5b6100848361004d565b91506100926020840161004d565b90509250929050565b60805160601c60a05160601c6112176100ce60003980610342525080610366528061058652806106d552506112176000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c45a01551161005b578063c45a0155146100d3578063cdca1753146100db578063f7729d43146100ee578063fa461e33146101015761007d565b80632f80bb1d1461008257806330d07f21146100ab5780634aa4a4fc146100be575b600080fd5b610095610090366004610e9e565b610116565b6040516100a29190611148565b60405180910390f35b6100956100b9366004610e30565b61017b565b6100c6610340565b6040516100a29190611084565b6100c6610364565b6100956100e9366004610e9e565b610388565b6100956100fc366004610e30565b6103d6565b61011461010f366004610f04565b610555565b005b60005b600061012484610660565b9050600080600061013487610668565b92509250925061014882848389600061017b565b955083156101605761015987610699565b965061016c565b85945050505050610175565b50505050610119565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff808616878216109083166101a65760008490555b6101b18787876106ce565b73ffffffffffffffffffffffffffffffffffffffff1663128acb0830836101d78861070c565b60000373ffffffffffffffffffffffffffffffffffffffff8816156101fc5787610222565b8561021b5773fffd8963efd1fc6a506488495d951d5263988d25610222565b6401000276a45b8b8b8e6040516020016102379392919061101e565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016102669594939291906110a5565b6040805180830381600087803b15801561027f57600080fd5b505af19250505080156102cd575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01682019092526102ca91810190610ee1565b60015b610333573d8080156102fb576040519150601f19603f3d011682016040523d82523d6000602084013e610300565b606091505b5073ffffffffffffffffffffffffffffffffffffffff841661032157600080555b61032a8161073e565b92505050610337565b5050505b95945050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60005b600061039684610660565b905060008060006103a687610668565b9250925092506103ba8383838960006103d6565b95508315610160576103cb87610699565b96505050505061038b565b600073ffffffffffffffffffffffffffffffffffffffff808616908716106103ff8787876106ce565b73ffffffffffffffffffffffffffffffffffffffff1663128acb0830836104258861070c565b73ffffffffffffffffffffffffffffffffffffffff881615610447578761046d565b856104665773fffd8963efd1fc6a506488495d951d5263988d2561046d565b6401000276a45b8c8b8d6040516020016104829392919061101e565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016104b19594939291906110a5565b6040805180830381600087803b1580156104ca57600080fd5b505af1925050508015610518575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261051591810190610ee1565b60015b610333573d808015610546576040519150601f19603f3d011682016040523d82523d6000602084013e61054b565b606091505b5061032a8161073e565b60008313806105645750600082135b61056d57600080fd5b600080600061057b84610668565b9250925092506105ad7f00000000000000000000000000000000000000000000000000000000000000008484846107ef565b5060008060008089136105f3578573ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1610888a600003610628565b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff161089896000035b925092509250821561063f57604051818152602081fd5b6000541561065557600054811461065557600080fd5b604051828152602081fd5b516042111590565b600080806106768482610805565b9250610683846014610905565b9050610690846017610805565b91509193909250565b80516060906101759083906017907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe9016109f5565b60006107047f00000000000000000000000000000000000000000000000000000000000000006106ff868686610bdc565b610c59565b949350505050565b60007f8000000000000000000000000000000000000000000000000000000000000000821061073a57600080fd5b5090565b600081516020146107db5760448251101561078e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078590611111565b60405180910390fd5b600482019150818060200190518101906107a89190610f52565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078591906110f7565b818060200190518101906101759190610fbc565b600061033785610800868686610bdc565b610d8f565b60008182601401101561087957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f746f416464726573735f6f766572666c6f770000000000000000000000000000604482015290519081900360640190fd5b81601401835110156108ec57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f746f416464726573735f6f75744f66426f756e64730000000000000000000000604482015290519081900360640190fd5b5001602001516c01000000000000000000000000900490565b60008182600301101561097957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f746f55696e7432345f6f766572666c6f77000000000000000000000000000000604482015290519081900360640190fd5b81600301835110156109ec57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f746f55696e7432345f6f75744f66426f756e6473000000000000000000000000604482015290519081900360640190fd5b50016003015190565b60608182601f011015610a6957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600e60248201527f736c6963655f6f766572666c6f77000000000000000000000000000000000000604482015290519081900360640190fd5b828284011015610ada57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600e60248201527f736c6963655f6f766572666c6f77000000000000000000000000000000000000604482015290519081900360640190fd5b81830184511015610b4c57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f736c6963655f6f75744f66426f756e6473000000000000000000000000000000604482015290519081900360640190fd5b606082158015610b6b5760405191506000825260208201604052610bd3565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610ba4578051835260209283019201610b8c565b5050858452601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016604052505b50949350505050565b610be4610dbf565b8273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161115610c1c579192915b506040805160608101825273ffffffffffffffffffffffffffffffffffffffff948516815292909316602083015262ffffff169181019190915290565b6000816020015173ffffffffffffffffffffffffffffffffffffffff16826000015173ffffffffffffffffffffffffffffffffffffffff1610610c9b57600080fd5b508051602080830151604093840151845173ffffffffffffffffffffffffffffffffffffffff94851681850152939091168385015262ffffff166060808401919091528351808403820181526080840185528051908301207fff0000000000000000000000000000000000000000000000000000000000000060a085015294901b7fffffffffffffffffffffffffffffffffffffffff0000000000000000000000001660a183015260b58201939093527fe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b5460d5808301919091528251808303909101815260f5909101909152805191012090565b6000610d9b8383610c59565b90503373ffffffffffffffffffffffffffffffffffffffff82161461017557600080fd5b604080516060810182526000808252602082018190529181019190915290565b600082601f830112610def578081fd5b8135610e02610dfd82611175565b611151565b818152846020838601011115610e16578283fd5b816020850160208301379081016020019190915292915050565b600080600080600060a08688031215610e47578081fd5b8535610e52816111e5565b94506020860135610e62816111e5565b9350604086013562ffffff81168114610e79578182fd5b9250606086013591506080860135610e90816111e5565b809150509295509295909350565b60008060408385031215610eb0578182fd5b823567ffffffffffffffff811115610ec6578283fd5b610ed285828601610ddf565b95602094909401359450505050565b60008060408385031215610ef3578182fd5b505080516020909101519092909150565b600080600060608486031215610f18578283fd5b8335925060208401359150604084013567ffffffffffffffff811115610f3c578182fd5b610f4886828701610ddf565b9150509250925092565b600060208284031215610f63578081fd5b815167ffffffffffffffff811115610f79578182fd5b8201601f81018413610f89578182fd5b8051610f97610dfd82611175565b818152856020838501011115610fab578384fd5b6103378260208301602086016111b5565b600060208284031215610fcd578081fd5b5051919050565b60008151808452610fec8160208601602086016111b5565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b606093841b7fffffffffffffffffffffffffffffffffffffffff000000000000000000000000908116825260e89390931b7fffffff0000000000000000000000000000000000000000000000000000000000166014820152921b166017820152602b0190565b73ffffffffffffffffffffffffffffffffffffffff91909116815260200190565b600073ffffffffffffffffffffffffffffffffffffffff8088168352861515602084015285604084015280851660608401525060a060808301526110ec60a0830184610fd4565b979650505050505050565b60006020825261110a6020830184610fd4565b9392505050565b60208082526010908201527f556e6578706563746564206572726f7200000000000000000000000000000000604082015260600190565b90815260200190565b60405181810167ffffffffffffffff8111828210171561116d57fe5b604052919050565b600067ffffffffffffffff82111561118957fe5b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b60005b838110156111d05781810151838201526020016111b8565b838111156111df576000848401525b50505050565b73ffffffffffffffffffffffffffffffffffffffff8116811461120757600080fd5b5056fea164736f6c6343000706000a";
var deployedBytecode$1 = "0x608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c45a01551161005b578063c45a0155146100d3578063cdca1753146100db578063f7729d43146100ee578063fa461e33146101015761007d565b80632f80bb1d1461008257806330d07f21146100ab5780634aa4a4fc146100be575b600080fd5b610095610090366004610e9e565b610116565b6040516100a29190611148565b60405180910390f35b6100956100b9366004610e30565b61017b565b6100c6610340565b6040516100a29190611084565b6100c6610364565b6100956100e9366004610e9e565b610388565b6100956100fc366004610e30565b6103d6565b61011461010f366004610f04565b610555565b005b60005b600061012484610660565b9050600080600061013487610668565b92509250925061014882848389600061017b565b955083156101605761015987610699565b965061016c565b85945050505050610175565b50505050610119565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff808616878216109083166101a65760008490555b6101b18787876106ce565b73ffffffffffffffffffffffffffffffffffffffff1663128acb0830836101d78861070c565b60000373ffffffffffffffffffffffffffffffffffffffff8816156101fc5787610222565b8561021b5773fffd8963efd1fc6a506488495d951d5263988d25610222565b6401000276a45b8b8b8e6040516020016102379392919061101e565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016102669594939291906110a5565b6040805180830381600087803b15801561027f57600080fd5b505af19250505080156102cd575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01682019092526102ca91810190610ee1565b60015b610333573d8080156102fb576040519150601f19603f3d011682016040523d82523d6000602084013e610300565b606091505b5073ffffffffffffffffffffffffffffffffffffffff841661032157600080555b61032a8161073e565b92505050610337565b5050505b95945050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60005b600061039684610660565b905060008060006103a687610668565b9250925092506103ba8383838960006103d6565b95508315610160576103cb87610699565b96505050505061038b565b600073ffffffffffffffffffffffffffffffffffffffff808616908716106103ff8787876106ce565b73ffffffffffffffffffffffffffffffffffffffff1663128acb0830836104258861070c565b73ffffffffffffffffffffffffffffffffffffffff881615610447578761046d565b856104665773fffd8963efd1fc6a506488495d951d5263988d2561046d565b6401000276a45b8c8b8d6040516020016104829392919061101e565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016104b19594939291906110a5565b6040805180830381600087803b1580156104ca57600080fd5b505af1925050508015610518575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261051591810190610ee1565b60015b610333573d808015610546576040519150601f19603f3d011682016040523d82523d6000602084013e61054b565b606091505b5061032a8161073e565b60008313806105645750600082135b61056d57600080fd5b600080600061057b84610668565b9250925092506105ad7f00000000000000000000000000000000000000000000000000000000000000008484846107ef565b5060008060008089136105f3578573ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1610888a600003610628565b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff161089896000035b925092509250821561063f57604051818152602081fd5b6000541561065557600054811461065557600080fd5b604051828152602081fd5b516042111590565b600080806106768482610805565b9250610683846014610905565b9050610690846017610805565b91509193909250565b80516060906101759083906017907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe9016109f5565b60006107047f00000000000000000000000000000000000000000000000000000000000000006106ff868686610bdc565b610c59565b949350505050565b60007f8000000000000000000000000000000000000000000000000000000000000000821061073a57600080fd5b5090565b600081516020146107db5760448251101561078e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078590611111565b60405180910390fd5b600482019150818060200190518101906107a89190610f52565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078591906110f7565b818060200190518101906101759190610fbc565b600061033785610800868686610bdc565b610d8f565b60008182601401101561087957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f746f416464726573735f6f766572666c6f770000000000000000000000000000604482015290519081900360640190fd5b81601401835110156108ec57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f746f416464726573735f6f75744f66426f756e64730000000000000000000000604482015290519081900360640190fd5b5001602001516c01000000000000000000000000900490565b60008182600301101561097957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f746f55696e7432345f6f766572666c6f77000000000000000000000000000000604482015290519081900360640190fd5b81600301835110156109ec57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f746f55696e7432345f6f75744f66426f756e6473000000000000000000000000604482015290519081900360640190fd5b50016003015190565b60608182601f011015610a6957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600e60248201527f736c6963655f6f766572666c6f77000000000000000000000000000000000000604482015290519081900360640190fd5b828284011015610ada57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600e60248201527f736c6963655f6f766572666c6f77000000000000000000000000000000000000604482015290519081900360640190fd5b81830184511015610b4c57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f736c6963655f6f75744f66426f756e6473000000000000000000000000000000604482015290519081900360640190fd5b606082158015610b6b5760405191506000825260208201604052610bd3565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610ba4578051835260209283019201610b8c565b5050858452601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016604052505b50949350505050565b610be4610dbf565b8273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161115610c1c579192915b506040805160608101825273ffffffffffffffffffffffffffffffffffffffff948516815292909316602083015262ffffff169181019190915290565b6000816020015173ffffffffffffffffffffffffffffffffffffffff16826000015173ffffffffffffffffffffffffffffffffffffffff1610610c9b57600080fd5b508051602080830151604093840151845173ffffffffffffffffffffffffffffffffffffffff94851681850152939091168385015262ffffff166060808401919091528351808403820181526080840185528051908301207fff0000000000000000000000000000000000000000000000000000000000000060a085015294901b7fffffffffffffffffffffffffffffffffffffffff0000000000000000000000001660a183015260b58201939093527fe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b5460d5808301919091528251808303909101815260f5909101909152805191012090565b6000610d9b8383610c59565b90503373ffffffffffffffffffffffffffffffffffffffff82161461017557600080fd5b604080516060810182526000808252602082018190529181019190915290565b600082601f830112610def578081fd5b8135610e02610dfd82611175565b611151565b818152846020838601011115610e16578283fd5b816020850160208301379081016020019190915292915050565b600080600080600060a08688031215610e47578081fd5b8535610e52816111e5565b94506020860135610e62816111e5565b9350604086013562ffffff81168114610e79578182fd5b9250606086013591506080860135610e90816111e5565b809150509295509295909350565b60008060408385031215610eb0578182fd5b823567ffffffffffffffff811115610ec6578283fd5b610ed285828601610ddf565b95602094909401359450505050565b60008060408385031215610ef3578182fd5b505080516020909101519092909150565b600080600060608486031215610f18578283fd5b8335925060208401359150604084013567ffffffffffffffff811115610f3c578182fd5b610f4886828701610ddf565b9150509250925092565b600060208284031215610f63578081fd5b815167ffffffffffffffff811115610f79578182fd5b8201601f81018413610f89578182fd5b8051610f97610dfd82611175565b818152856020838501011115610fab578384fd5b6103378260208301602086016111b5565b600060208284031215610fcd578081fd5b5051919050565b60008151808452610fec8160208601602086016111b5565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b606093841b7fffffffffffffffffffffffffffffffffffffffff000000000000000000000000908116825260e89390931b7fffffff0000000000000000000000000000000000000000000000000000000000166014820152921b166017820152602b0190565b73ffffffffffffffffffffffffffffffffffffffff91909116815260200190565b600073ffffffffffffffffffffffffffffffffffffffff8088168352861515602084015285604084015280851660608401525060a060808301526110ec60a0830184610fd4565b979650505050505050565b60006020825261110a6020830184610fd4565b9392505050565b60208082526010908201527f556e6578706563746564206572726f7200000000000000000000000000000000604082015260600190565b90815260200190565b60405181810167ffffffffffffffff8111828210171561116d57fe5b604052919050565b600067ffffffffffffffff82111561118957fe5b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b60005b838110156111d05781810151838201526020016111b8565b838111156111df576000848401525b50505050565b73ffffffffffffffffffffffffffffffffffffffff8116811461120757600080fd5b5056fea164736f6c6343000706000a";
var linkReferences$1 = {
};
var deployedLinkReferences$1 = {
};
var QuoterJson = {
	_format: _format$1,
	contractName: contractName$1,
	sourceName: sourceName$1,
	abi: abi$2,
	bytecode: bytecode$1,
	deployedBytecode: deployedBytecode$1,
	linkReferences: linkReferences$1,
	deployedLinkReferences: deployedLinkReferences$1
};

var _format = "hh-sol-artifact-1";
var contractName = "UniswapInterfaceMulticall";
var sourceName = "contracts/lens/UniswapInterfaceMulticall.sol";
var abi$1 = [
	{
		inputs: [
		],
		name: "getCurrentBlockTimestamp",
		outputs: [
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address"
			}
		],
		name: "getEthBalance",
		outputs: [
			{
				internalType: "uint256",
				name: "balance",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "target",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "gasLimit",
						type: "uint256"
					},
					{
						internalType: "bytes",
						name: "callData",
						type: "bytes"
					}
				],
				internalType: "struct UniswapInterfaceMulticall.Call[]",
				name: "calls",
				type: "tuple[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "uint256",
				name: "blockNumber",
				type: "uint256"
			},
			{
				components: [
					{
						internalType: "bool",
						name: "success",
						type: "bool"
					},
					{
						internalType: "uint256",
						name: "gasUsed",
						type: "uint256"
					},
					{
						internalType: "bytes",
						name: "returnData",
						type: "bytes"
					}
				],
				internalType: "struct UniswapInterfaceMulticall.Result[]",
				name: "returnData",
				type: "tuple[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];
var bytecode = "0x608060405234801561001057600080fd5b50610567806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630f28c97d146100465780631749e1e3146100645780634d2301cc14610085575b600080fd5b61004e610098565b60405161005b919061041f565b60405180910390f35b6100776100723660046102a7565b61009c565b60405161005b929190610428565b61004e610093366004610286565b610220565b4290565b8051439060609067ffffffffffffffff811180156100b957600080fd5b506040519080825280602002602001820160405280156100f357816020015b6100e061023a565b8152602001906001900390816100d85790505b50905060005b835181101561021a57600080600086848151811061011357fe5b60200260200101516000015187858151811061012b57fe5b60200260200101516020015188868151811061014357fe5b60200260200101516040015192509250925060005a90506000808573ffffffffffffffffffffffffffffffffffffffff1685856040516101839190610403565b60006040518083038160008787f1925050503d80600081146101c1576040519150601f19603f3d011682016040523d82523d6000602084013e6101c6565b606091505b509150915060005a8403905060405180606001604052808415158152602001828152602001838152508989815181106101fb57fe5b60200260200101819052505050505050505080806001019150506100f9565b50915091565b73ffffffffffffffffffffffffffffffffffffffff163190565b604051806060016040528060001515815260200160008152602001606081525090565b803573ffffffffffffffffffffffffffffffffffffffff8116811461028157600080fd5b919050565b600060208284031215610297578081fd5b6102a08261025d565b9392505050565b600060208083850312156102b9578182fd5b823567ffffffffffffffff808211156102d0578384fd5b818501915085601f8301126102e3578384fd5b8135818111156102ef57fe5b6102fc8485830201610506565b81815284810190848601875b848110156103f457813587017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0606081838f03011215610346578a8bfd5b60408051606081018181108b8211171561035c57fe5b8252610369848d0161025d565b8152818401358c82015260608401358a811115610384578d8efd5b8085019450508e603f850112610398578c8dfd5b8b8401358a8111156103a657fe5b6103b68d85601f84011601610506565b93508084528f838287010111156103cb578d8efd5b808386018e86013783018c018d9052908101919091528552509287019290870190600101610308565b50909998505050505050505050565b6000825161041581846020870161052a565b9190910192915050565b90815260200190565b600060408083018584526020828186015281865180845260609350838701915083838202880101838901875b838110156104f6578983037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa001855281518051151584528681015187850152880151888401889052805188850181905260806104b582828801858c0161052a565b96880196601f919091017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01694909401909301925090850190600101610454565b50909a9950505050505050505050565b60405181810167ffffffffffffffff8111828210171561052257fe5b604052919050565b60005b8381101561054557818101518382015260200161052d565b83811115610554576000848401525b5050505056fea164736f6c6343000706000a";
var deployedBytecode = "0x608060405234801561001057600080fd5b50600436106100415760003560e01c80630f28c97d146100465780631749e1e3146100645780634d2301cc14610085575b600080fd5b61004e610098565b60405161005b919061041f565b60405180910390f35b6100776100723660046102a7565b61009c565b60405161005b929190610428565b61004e610093366004610286565b610220565b4290565b8051439060609067ffffffffffffffff811180156100b957600080fd5b506040519080825280602002602001820160405280156100f357816020015b6100e061023a565b8152602001906001900390816100d85790505b50905060005b835181101561021a57600080600086848151811061011357fe5b60200260200101516000015187858151811061012b57fe5b60200260200101516020015188868151811061014357fe5b60200260200101516040015192509250925060005a90506000808573ffffffffffffffffffffffffffffffffffffffff1685856040516101839190610403565b60006040518083038160008787f1925050503d80600081146101c1576040519150601f19603f3d011682016040523d82523d6000602084013e6101c6565b606091505b509150915060005a8403905060405180606001604052808415158152602001828152602001838152508989815181106101fb57fe5b60200260200101819052505050505050505080806001019150506100f9565b50915091565b73ffffffffffffffffffffffffffffffffffffffff163190565b604051806060016040528060001515815260200160008152602001606081525090565b803573ffffffffffffffffffffffffffffffffffffffff8116811461028157600080fd5b919050565b600060208284031215610297578081fd5b6102a08261025d565b9392505050565b600060208083850312156102b9578182fd5b823567ffffffffffffffff808211156102d0578384fd5b818501915085601f8301126102e3578384fd5b8135818111156102ef57fe5b6102fc8485830201610506565b81815284810190848601875b848110156103f457813587017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0606081838f03011215610346578a8bfd5b60408051606081018181108b8211171561035c57fe5b8252610369848d0161025d565b8152818401358c82015260608401358a811115610384578d8efd5b8085019450508e603f850112610398578c8dfd5b8b8401358a8111156103a657fe5b6103b68d85601f84011601610506565b93508084528f838287010111156103cb578d8efd5b808386018e86013783018c018d9052908101919091528552509287019290870190600101610308565b50909998505050505050505050565b6000825161041581846020870161052a565b9190910192915050565b90815260200190565b600060408083018584526020828186015281865180845260609350838701915083838202880101838901875b838110156104f6578983037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa001855281518051151584528681015187850152880151888401889052805188850181905260806104b582828801858c0161052a565b96880196601f919091017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01694909401909301925090850190600101610454565b50909a9950505050505050505050565b60405181810167ffffffffffffffff8111828210171561052257fe5b604052919050565b60005b8381101561054557818101518382015260200161052d565b83811115610554576000848401525b5050505056fea164736f6c6343000706000a";
var linkReferences = {
};
var deployedLinkReferences = {
};
var UniswapInterfaceMulticallJson = {
	_format: _format,
	contractName: contractName,
	sourceName: sourceName,
	abi: abi$1,
	bytecode: bytecode,
	deployedBytecode: deployedBytecode,
	linkReferences: linkReferences,
	deployedLinkReferences: deployedLinkReferences
};

var ENS_PUBLIC_RESOLVER_ABI = [
	{
		inputs: [
			{
				internalType: "contract ENS",
				name: "_ens",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "contentType",
				type: "uint256"
			}
		],
		name: "ABIChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "a",
				type: "address"
			}
		],
		name: "AddrChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "coinType",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "newAddress",
				type: "bytes"
			}
		],
		name: "AddressChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "target",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "isAuthorised",
				type: "bool"
			}
		],
		name: "AuthorisationChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "hash",
				type: "bytes"
			}
		],
		name: "ContenthashChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "name",
				type: "bytes"
			},
			{
				indexed: false,
				internalType: "uint16",
				name: "resource",
				type: "uint16"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "record",
				type: "bytes"
			}
		],
		name: "DNSRecordChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "name",
				type: "bytes"
			},
			{
				indexed: false,
				internalType: "uint16",
				name: "resource",
				type: "uint16"
			}
		],
		name: "DNSRecordDeleted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "DNSZoneCleared",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes4",
				name: "interfaceID",
				type: "bytes4"
			},
			{
				indexed: false,
				internalType: "address",
				name: "implementer",
				type: "address"
			}
		],
		name: "InterfaceChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "string",
				name: "name",
				type: "string"
			}
		],
		name: "NameChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "bytes32",
				name: "x",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "bytes32",
				name: "y",
				type: "bytes32"
			}
		],
		name: "PubkeyChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "string",
				name: "indexedKey",
				type: "string"
			},
			{
				indexed: false,
				internalType: "string",
				name: "key",
				type: "string"
			}
		],
		name: "TextChanged",
		type: "event"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "uint256",
				name: "contentTypes",
				type: "uint256"
			}
		],
		name: "ABI",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "addr",
		outputs: [
			{
				internalType: "address payable",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "authorisations",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "clearDNSZone",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "contenthash",
		outputs: [
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "name",
				type: "bytes32"
			},
			{
				internalType: "uint16",
				name: "resource",
				type: "uint16"
			}
		],
		name: "dnsRecord",
		outputs: [
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "name",
				type: "bytes32"
			}
		],
		name: "hasDNSRecords",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes4",
				name: "interfaceID",
				type: "bytes4"
			}
		],
		name: "interfaceImplementer",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "pubkey",
		outputs: [
			{
				internalType: "bytes32",
				name: "x",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "y",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "uint256",
				name: "contentType",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "setABI",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "uint256",
				name: "coinType",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "a",
				type: "bytes"
			}
		],
		name: "setAddr",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "a",
				type: "address"
			}
		],
		name: "setAddr",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "target",
				type: "address"
			},
			{
				internalType: "bool",
				name: "isAuthorised",
				type: "bool"
			}
		],
		name: "setAuthorisation",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes",
				name: "hash",
				type: "bytes"
			}
		],
		name: "setContenthash",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "setDNSRecords",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes4",
				name: "interfaceID",
				type: "bytes4"
			},
			{
				internalType: "address",
				name: "implementer",
				type: "address"
			}
		],
		name: "setInterface",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "string",
				name: "name",
				type: "string"
			}
		],
		name: "setName",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "x",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "y",
				type: "bytes32"
			}
		],
		name: "setPubkey",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "string",
				name: "key",
				type: "string"
			},
			{
				internalType: "string",
				name: "value",
				type: "string"
			}
		],
		name: "setText",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceID",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "pure",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "string",
				name: "key",
				type: "string"
			}
		],
		name: "text",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var ENS_ABI = [
	{
		inputs: [
			{
				internalType: "contract ENS",
				name: "_old",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "ApprovalForAll",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "label",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "NewOwner",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "resolver",
				type: "address"
			}
		],
		name: "NewResolver",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint64",
				name: "ttl",
				type: "uint64"
			}
		],
		name: "NewTTL",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			}
		],
		name: "isApprovedForAll",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "old",
		outputs: [
			{
				internalType: "contract ENS",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "recordExists",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "resolver",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "setApprovalForAll",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "setOwner",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "resolver",
				type: "address"
			},
			{
				internalType: "uint64",
				name: "ttl",
				type: "uint64"
			}
		],
		name: "setRecord",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "resolver",
				type: "address"
			}
		],
		name: "setResolver",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "label",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "setSubnodeOwner",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "label",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "resolver",
				type: "address"
			},
			{
				internalType: "uint64",
				name: "ttl",
				type: "uint64"
			}
		],
		name: "setSubnodeRecord",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			},
			{
				internalType: "uint64",
				name: "ttl",
				type: "uint64"
			}
		],
		name: "setTTL",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "bytes32",
				name: "node",
				type: "bytes32"
			}
		],
		name: "ttl",
		outputs: [
			{
				internalType: "uint64",
				name: "",
				type: "uint64"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var ERC20_BYTES32_ABI = [
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var WETH_ABI = [
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "guy",
				type: "address"
			},
			{
				name: "wad",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "src",
				type: "address"
			},
			{
				name: "dst",
				type: "address"
			},
			{
				name: "wad",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "wad",
				type: "uint256"
			}
		],
		name: "withdraw",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "dst",
				type: "address"
			},
			{
				name: "wad",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
		],
		name: "deposit",
		outputs: [
		],
		payable: true,
		stateMutability: "payable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "",
				type: "address"
			},
			{
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		payable: true,
		stateMutability: "payable",
		type: "fallback"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address"
			},
			{
				indexed: true,
				name: "guy",
				type: "address"
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address"
			},
			{
				indexed: true,
				name: "dst",
				type: "address"
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "dst",
				type: "address"
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256"
			}
		],
		name: "Deposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address"
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256"
			}
		],
		name: "Withdrawal",
		type: "event"
	}
];

// returns the checksummed address if the address is valid, otherwise returns false
function isAddress(value) {
  try {
    return address.getAddress(value);
  } catch (_unused) {
    return false;
  }
} // shorten the checksummed version of the input address to have 0x + 4 characters at start and end

function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
} // account is optional


function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
} // account is optional


function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === constants.AddressZero) {
    throw Error("Invalid 'address' parameter '".concat(address, "'."));
  }

  return new contracts.Contract(address, ABI, getProviderOrSigner(library, account));
}

var QuoterABI = QuoterJson.abi;
var MulticallABI = UniswapInterfaceMulticallJson.abi;

function useContract(addressOrAddressMap, ABI) {
  var withSignerIfPossible = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var _useActiveWeb3React = useActiveWeb3React(),
      library = _useActiveWeb3React.library,
      account = _useActiveWeb3React.account,
      chainId = _useActiveWeb3React.chainId;

  return React.useMemo(function () {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
    var address;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;else address = addressOrAddressMap[chainId];
    if (!address) return null;

    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]);
}
function useTokenContract(tokenAddress, withSignerIfPossible) {
  return useContract(tokenAddress, ERC20ABI, withSignerIfPossible);
}
function useWETHContract(withSignerIfPossible) {
  var _WRAPPED_NATIVE_CURRE;

  var _useActiveWeb3React2 = useActiveWeb3React(),
      chainId = _useActiveWeb3React2.chainId;

  return useContract(chainId ? (_WRAPPED_NATIVE_CURRE = WRAPPED_NATIVE_CURRENCY[chainId]) === null || _WRAPPED_NATIVE_CURRE === void 0 ? void 0 : _WRAPPED_NATIVE_CURRE.address : undefined, WETH_ABI, withSignerIfPossible);
}
function useENSRegistrarContract(withSignerIfPossible) {
  return useContract(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible);
}
function useENSResolverContract(address, withSignerIfPossible) {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}
function useBytes32TokenContract(tokenAddress, withSignerIfPossible) {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}
function useInterfaceMulticall() {
  return useContract(MULTICALL_ADDRESS, MulticallABI, false);
}
function useV3Quoter() {
  return useContract(QUOTER_ADDRESSES, QuoterABI);
}

var multicall = reduxMulticall.createMulticall();
var reducer$1 = redux.combineReducers(_defineProperty__default["default"]({}, multicall.reducerPath, multicall.reducer));
var store = redux.createStore(reducer$1);
function MulticallUpdater() {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var latestBlockNumber = useBlockNumber();
  var contract = useInterfaceMulticall();
  return /*#__PURE__*/React__default["default"].createElement(multicall.Updater, {
    chainId: chainId,
    latestBlockNumber: latestBlockNumber,
    contract: contract
  });
}

// Create wrappers for hooks so consumers don't need to get latest block themselves

function useMultipleContractSingleData() {
  var _multicall$hooks;

  var _useCallContext = useCallContext(),
      chainId = _useCallContext.chainId,
      latestBlock = _useCallContext.latestBlock;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (_multicall$hooks = multicall.hooks).useMultipleContractSingleData.apply(_multicall$hooks, [chainId, latestBlock].concat(args));
}
function useSingleCallResult() {
  var _multicall$hooks2;

  var _useCallContext2 = useCallContext(),
      chainId = _useCallContext2.chainId,
      latestBlock = _useCallContext2.latestBlock;

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return (_multicall$hooks2 = multicall.hooks).useSingleCallResult.apply(_multicall$hooks2, [chainId, latestBlock].concat(args));
}
function useSingleContractMultipleData() {
  var _multicall$hooks3;

  var _useCallContext3 = useCallContext(),
      chainId = _useCallContext3.chainId,
      latestBlock = _useCallContext3.latestBlock;

  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return (_multicall$hooks3 = multicall.hooks).useSingleContractMultipleData.apply(_multicall$hooks3, [chainId, latestBlock].concat(args));
}
function useSingleContractWithCallData() {
  var _multicall$hooks4;

  var _useCallContext4 = useCallContext(),
      chainId = _useCallContext4.chainId,
      latestBlock = _useCallContext4.latestBlock;

  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  return (_multicall$hooks4 = multicall.hooks).useSingleContractWithCallData.apply(_multicall$hooks4, [chainId, latestBlock].concat(args));
}

function useCallContext() {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var latestBlock = useBlockNumber();
  return {
    chainId: chainId,
    latestBlock: latestBlock
  };
}

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */

function useNativeCurrencyBalances(uncheckedAddresses) {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var multicallContract = useInterfaceMulticall();
  var validAddressInputs = React.useMemo(function () {
    return uncheckedAddresses ? uncheckedAddresses.map(isAddress).filter(function (a) {
      return a !== false;
    }).sort().map(function (addr) {
      return [addr];
    }) : [];
  }, [uncheckedAddresses]);
  var results = useSingleContractMultipleData(multicallContract, 'getEthBalance', validAddressInputs);
  return React.useMemo(function () {
    return validAddressInputs.reduce(function (memo, _ref, i) {
      var _results$i, _results$i$result;

      var _ref2 = _slicedToArray__default["default"](_ref, 1),
          address = _ref2[0];

      var value = results === null || results === void 0 ? void 0 : (_results$i = results[i]) === null || _results$i === void 0 ? void 0 : (_results$i$result = _results$i.result) === null || _results$i$result === void 0 ? void 0 : _results$i$result[0];
      if (value && chainId) memo[address] = sdkCore.CurrencyAmount.fromRawAmount(nativeOnChain(chainId), JSBI__default["default"].BigInt(value.toString()));
      return memo;
    }, {});
  }, [validAddressInputs, chainId, results]);
}
var ERC20Interface = new abi$4.Interface(ERC20ABI);
var tokenBalancesGasRequirement = {
  gasRequired: 185000
};
/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */

function useTokenBalancesWithLoadingIndicator(address, tokens) {
  var validatedTokens = React.useMemo(function () {
    var _tokens$filter;

    return (_tokens$filter = tokens === null || tokens === void 0 ? void 0 : tokens.filter(function (t) {
      return isAddress(t === null || t === void 0 ? void 0 : t.address) !== false;
    })) !== null && _tokens$filter !== void 0 ? _tokens$filter : [];
  }, [tokens]);
  var validatedTokenAddresses = React.useMemo(function () {
    return validatedTokens.map(function (vt) {
      return vt.address;
    });
  }, [validatedTokens]);
  var balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20Interface, 'balanceOf', React.useMemo(function () {
    return [address];
  }, [address]), tokenBalancesGasRequirement);
  var anyLoading = React.useMemo(function () {
    return balances.some(function (callState) {
      return callState.loading;
    });
  }, [balances]);
  return React.useMemo(function () {
    return [address && validatedTokens.length > 0 ? validatedTokens.reduce(function (memo, token, i) {
      var _balances$i, _balances$i$result;

      var value = balances === null || balances === void 0 ? void 0 : (_balances$i = balances[i]) === null || _balances$i === void 0 ? void 0 : (_balances$i$result = _balances$i.result) === null || _balances$i$result === void 0 ? void 0 : _balances$i$result[0];
      var amount = value ? JSBI__default["default"].BigInt(value.toString()) : undefined;

      if (amount) {
        memo[token.address] = sdkCore.CurrencyAmount.fromRawAmount(token, amount);
      }

      return memo;
    }, {}) : {}, anyLoading];
  }, [address, validatedTokens, anyLoading, balances]);
}
function useTokenBalances(address, tokens) {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
} // get the balance for a single token/account combo
function useCurrencyBalances(account, currencies) {
  var tokens = React.useMemo(function () {
    var _currencies$filter;

    return (_currencies$filter = currencies === null || currencies === void 0 ? void 0 : currencies.filter(function (currency) {
      var _currency$isToken;

      return (_currency$isToken = currency === null || currency === void 0 ? void 0 : currency.isToken) !== null && _currency$isToken !== void 0 ? _currency$isToken : false;
    })) !== null && _currencies$filter !== void 0 ? _currencies$filter : [];
  }, [currencies]);
  var tokenBalances = useTokenBalances(account, tokens);
  var containsETH = React.useMemo(function () {
    var _currencies$some;

    return (_currencies$some = currencies === null || currencies === void 0 ? void 0 : currencies.some(function (currency) {
      return currency === null || currency === void 0 ? void 0 : currency.isNative;
    })) !== null && _currencies$some !== void 0 ? _currencies$some : false;
  }, [currencies]);
  var ethBalance = useNativeCurrencyBalances(React.useMemo(function () {
    return containsETH ? [account] : [];
  }, [containsETH, account]));
  return React.useMemo(function () {
    var _currencies$map;

    return (_currencies$map = currencies === null || currencies === void 0 ? void 0 : currencies.map(function (currency) {
      if (!account || !currency) return undefined;
      if (currency.isToken) return tokenBalances[currency.address];
      if (currency.isNative) return ethBalance[account];
      return undefined;
    })) !== null && _currencies$map !== void 0 ? _currencies$map : [];
  }, [account, currencies, ethBalance, tokenBalances]);
}
function useCurrencyBalance(account, currency) {
  return useCurrencyBalances(account, React.useMemo(function () {
    return [currency];
  }, [currency]))[0];
}

function useNativeCurrency() {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  return React.useMemo(function () {
    return chainId ? nativeOnChain(chainId) : // display mainnet when not connected
    nativeOnChain(exports.SupportedChainId.MAINNET);
  }, [chainId]);
}

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString);
}

function safeNamehash(name) {
  if (name === undefined) return undefined;

  try {
    return hash.namehash(name);
  } catch (error) {
    console.debug(error);
    return undefined;
  }
}

/**
 * Debounces updates to a value.
 * Non-primitives *must* wrap the value in useMemo, or the value will be updated due to referential inequality.
 */
// modified from https://usehooks.com/useDebounce/

function useDebounce(value, delay) {
  var _useState = React.useState(value),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      debouncedValue = _useState2[0],
      setDebouncedValue = _useState2[1];

  React.useEffect(function () {
    // Update debounced value after delay
    var handler = setTimeout(function () {
      setDebouncedValue(value);
    }, delay); // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.

    return function () {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Does a lookup for an ENS name to find its address.
 */

function useENSAddress(ensName) {
  var _resolverAddress$resu;

  var debouncedName = useDebounce(ensName, 200);
  var ensNodeArgument = React.useMemo(function () {
    return [debouncedName === null ? undefined : safeNamehash(debouncedName)];
  }, [debouncedName]);
  var registrarContract = useENSRegistrarContract(false);
  var resolverAddress = useSingleCallResult(registrarContract, 'resolver', ensNodeArgument);
  var resolverAddressResult = (_resolverAddress$resu = resolverAddress.result) === null || _resolverAddress$resu === void 0 ? void 0 : _resolverAddress$resu[0];
  var resolverContract = useENSResolverContract(resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined, false);
  var addr = useSingleCallResult(resolverContract, 'addr', ensNodeArgument);
  var changed = debouncedName !== ensName;
  return React.useMemo(function () {
    var _addr$result$, _addr$result;

    return {
      address: changed ? null : (_addr$result$ = (_addr$result = addr.result) === null || _addr$result === void 0 ? void 0 : _addr$result[0]) !== null && _addr$result$ !== void 0 ? _addr$result$ : null,
      loading: changed || resolverAddress.loading || addr.loading
    };
  }, [addr.loading, addr.result, changed, resolverAddress.loading]);
}

var CHAIN_DATA_ABI = [{
  inputs: [],
  name: 'latestAnswer',
  outputs: [{
    internalType: 'int256',
    name: '',
    type: 'int256'
  }],
  stateMutability: 'view',
  type: 'function'
}];
/**
 * Returns the price of 1 gas in WEI for the currently selected network using the chainlink fast gas price oracle
 */

function useGasPrice() {
  var _useSingleCallResult$, _useSingleCallResult$2;

  var _useENSAddress = useENSAddress('fast-gas-gwei.data.eth'),
      address = _useENSAddress.address;

  var contract = useContract(address !== null && address !== void 0 ? address : undefined, CHAIN_DATA_ABI, false);
  var resultStr = (_useSingleCallResult$ = useSingleCallResult(contract, 'latestAnswer').result) === null || _useSingleCallResult$ === void 0 ? void 0 : (_useSingleCallResult$2 = _useSingleCallResult$[0]) === null || _useSingleCallResult$2 === void 0 ? void 0 : _useSingleCallResult$2.toString();
  return React.useMemo(function () {
    return typeof resultStr === 'string' ? JSBI__default["default"].BigInt(resultStr) : undefined;
  }, [resultStr]);
}

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */

function tryParseCurrencyAmount(value, currency) {
  if (!value || !currency) {
    return undefined;
  }

  try {
    var typedValueParsed = units.parseUnits(value, currency.decimals).toString();

    if (typedValueParsed !== '0') {
      return sdkCore.CurrencyAmount.fromRawAmount(currency, JSBI__default["default"].BigInt(typedValueParsed));
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug("Failed to parse input amount: \"".concat(value, "\""), error);
  }

  return undefined;
}

JSBI__default["default"].BigInt(60 * 60 * 24 * 7);
JSBI__default["default"].BigInt(0); // one basis JSBI.BigInt

var BIPS_BASE = JSBI__default["default"].BigInt(10000);
new sdkCore.Percent(JSBI__default["default"].BigInt(1), BIPS_BASE); // used for warning states

new sdkCore.Percent(JSBI__default["default"].BigInt(100), BIPS_BASE); // 1%

var ALLOWED_PRICE_IMPACT_MEDIUM = new sdkCore.Percent(JSBI__default["default"].BigInt(300), BIPS_BASE); // 3%

var ALLOWED_PRICE_IMPACT_HIGH = new sdkCore.Percent(JSBI__default["default"].BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute

new sdkCore.Percent(JSBI__default["default"].BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this

new sdkCore.Percent(JSBI__default["default"].BigInt(1500), BIPS_BASE); // 15%

var BETTER_TRADE_LESS_HOPS_THRESHOLD = new sdkCore.Percent(JSBI__default["default"].BigInt(50), BIPS_BASE);
var ZERO_PERCENT = new sdkCore.Percent('0');
new sdkCore.Percent(JSBI__default["default"].BigInt(200), BIPS_BASE);
var ONE_HUNDRED_PERCENT = new sdkCore.Percent('1');

// only used by v2 hooks

function isTradeBetter(tradeA, tradeB) {
  var minimumDelta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ZERO_PERCENT;
  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (tradeA.tradeType !== tradeB.tradeType || !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) || !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency)) {
    throw new Error('Comparing incomparable trades');
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  } else {
    return tradeA.executionPrice.asFraction.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice);
  }
}

var _objectSpread2, _SupportedChainId$MAI, _COMMON_BASES;

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$7(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var WRAPPED_NATIVE_CURRENCIES_ONLY = Object.fromEntries(Object.entries(WRAPPED_NATIVE_CURRENCY).map(function (_ref) {
  var _ref2 = _slicedToArray__default["default"](_ref, 2),
      key = _ref2[0],
      value = _ref2[1];

  return [key, [value]];
}).filter(Boolean)); // used to construct intermediary pairs for trading

var BASES_TO_CHECK_TRADES_AGAINST = _objectSpread$7(_objectSpread$7({}, WRAPPED_NATIVE_CURRENCIES_ONLY), {}, (_objectSpread2 = {}, _defineProperty__default["default"](_objectSpread2, exports.SupportedChainId.MAINNET, [].concat(_toConsumableArray__default["default"](WRAPPED_NATIVE_CURRENCIES_ONLY[exports.SupportedChainId.MAINNET]), [DAI, USDC_MAINNET, USDT, WBTC])), _defineProperty__default["default"](_objectSpread2, exports.SupportedChainId.OPTIMISM, [].concat(_toConsumableArray__default["default"](WRAPPED_NATIVE_CURRENCIES_ONLY[exports.SupportedChainId.OPTIMISM]), [DAI_OPTIMISM, USDT_OPTIMISM, WBTC_OPTIMISM])), _defineProperty__default["default"](_objectSpread2, exports.SupportedChainId.ARBITRUM_ONE, [].concat(_toConsumableArray__default["default"](WRAPPED_NATIVE_CURRENCIES_ONLY[exports.SupportedChainId.ARBITRUM_ONE]), [DAI_ARBITRUM_ONE, USDT_ARBITRUM_ONE, WBTC_ARBITRUM_ONE])), _defineProperty__default["default"](_objectSpread2, exports.SupportedChainId.POLYGON, [].concat(_toConsumableArray__default["default"](WRAPPED_NATIVE_CURRENCIES_ONLY[exports.SupportedChainId.POLYGON]), [DAI_POLYGON, USDC_POLYGON, USDT_POLYGON, WETH_POLYGON])), _objectSpread2));
var ADDITIONAL_BASES = _defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, (_SupportedChainId$MAI = {
  '0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0': [ETH2X_FLI]
}, _defineProperty__default["default"](_SupportedChainId$MAI, rETH2.address, [sETH2]), _defineProperty__default["default"](_SupportedChainId$MAI, SWISE.address, [sETH2]), _defineProperty__default["default"](_SupportedChainId$MAI, FEI.address, [TRIBE]), _defineProperty__default["default"](_SupportedChainId$MAI, TRIBE.address, [FEI]), _defineProperty__default["default"](_SupportedChainId$MAI, FRAX.address, [FXS]), _defineProperty__default["default"](_SupportedChainId$MAI, FXS.address, [FRAX]), _defineProperty__default["default"](_SupportedChainId$MAI, WBTC.address, [renBTC]), _defineProperty__default["default"](_SupportedChainId$MAI, renBTC.address, [WBTC]), _SupportedChainId$MAI));
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */

var CUSTOM_BASES = _defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, _defineProperty__default["default"]({}, AMPL.address, [DAI, WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.MAINNET]]));
/**
 * Shows up in the currency select for swap and add liquidity
 */

(_COMMON_BASES = {}, _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.MAINNET, [nativeOnChain(exports.SupportedChainId.MAINNET), DAI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.MAINNET]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.ROPSTEN, [nativeOnChain(exports.SupportedChainId.ROPSTEN), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.ROPSTEN]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.RINKEBY, [nativeOnChain(exports.SupportedChainId.RINKEBY), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.RINKEBY]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.GOERLI, [nativeOnChain(exports.SupportedChainId.GOERLI), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.GOERLI]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.KOVAN, [nativeOnChain(exports.SupportedChainId.KOVAN), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.KOVAN]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.ARBITRUM_ONE, [nativeOnChain(exports.SupportedChainId.ARBITRUM_ONE), DAI_ARBITRUM_ONE, USDC_ARBITRUM, USDT_ARBITRUM_ONE, WBTC_ARBITRUM_ONE, WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.ARBITRUM_ONE]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.ARBITRUM_RINKEBY, [nativeOnChain(exports.SupportedChainId.ARBITRUM_RINKEBY), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.ARBITRUM_RINKEBY]]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.OPTIMISM, [nativeOnChain(exports.SupportedChainId.OPTIMISM), DAI_OPTIMISM, USDC_OPTIMISM, USDT_OPTIMISM, WBTC_OPTIMISM]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.OPTIMISTIC_KOVAN, [nativeOnChain(exports.SupportedChainId.OPTIMISTIC_KOVAN)]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.POLYGON, [nativeOnChain(exports.SupportedChainId.POLYGON), WETH_POLYGON, USDC_POLYGON, DAI_POLYGON, USDT_POLYGON, WBTC_POLYGON]), _defineProperty__default["default"](_COMMON_BASES, exports.SupportedChainId.POLYGON_MUMBAI, [nativeOnChain(exports.SupportedChainId.POLYGON_MUMBAI), WRAPPED_NATIVE_CURRENCY[exports.SupportedChainId.POLYGON_MUMBAI], WETH_POLYGON_MUMBAI]), _COMMON_BASES); // used to construct the list of all pairs we consider by default in the frontend

_objectSpread$7(_objectSpread$7({}, WRAPPED_NATIVE_CURRENCIES_ONLY), {}, _defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, [].concat(_toConsumableArray__default["default"](WRAPPED_NATIVE_CURRENCIES_ONLY[exports.SupportedChainId.MAINNET]), [DAI, USDC_MAINNET, USDT, WBTC])));
_defineProperty__default["default"]({}, exports.SupportedChainId.MAINNET, [[new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'), new sdkCore.Token(exports.SupportedChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')], [USDC_MAINNET, USDT], [DAI, USDT]]);

function useAllCurrencyCombinations(currencyA, currencyB) {
  var chainId = currencyA === null || currencyA === void 0 ? void 0 : currencyA.chainId;

  var _ref = chainId ? [currencyA === null || currencyA === void 0 ? void 0 : currencyA.wrapped, currencyB === null || currencyB === void 0 ? void 0 : currencyB.wrapped] : [undefined, undefined],
      _ref2 = _slicedToArray__default["default"](_ref, 2),
      tokenA = _ref2[0],
      tokenB = _ref2[1];

  var bases = React.useMemo(function () {
    var _BASES_TO_CHECK_TRADE, _ADDITIONAL_BASES$cha, _ADDITIONAL_BASES$cha2, _ADDITIONAL_BASES$cha3, _ADDITIONAL_BASES$cha4;

    if (!chainId || chainId !== (tokenB === null || tokenB === void 0 ? void 0 : tokenB.chainId)) return [];
    var common = (_BASES_TO_CHECK_TRADE = BASES_TO_CHECK_TRADES_AGAINST[chainId]) !== null && _BASES_TO_CHECK_TRADE !== void 0 ? _BASES_TO_CHECK_TRADE : [];
    var additionalA = tokenA ? (_ADDITIONAL_BASES$cha = (_ADDITIONAL_BASES$cha2 = ADDITIONAL_BASES[chainId]) === null || _ADDITIONAL_BASES$cha2 === void 0 ? void 0 : _ADDITIONAL_BASES$cha2[tokenA.address]) !== null && _ADDITIONAL_BASES$cha !== void 0 ? _ADDITIONAL_BASES$cha : [] : [];
    var additionalB = tokenB ? (_ADDITIONAL_BASES$cha3 = (_ADDITIONAL_BASES$cha4 = ADDITIONAL_BASES[chainId]) === null || _ADDITIONAL_BASES$cha4 === void 0 ? void 0 : _ADDITIONAL_BASES$cha4[tokenB.address]) !== null && _ADDITIONAL_BASES$cha3 !== void 0 ? _ADDITIONAL_BASES$cha3 : [] : [];
    return [].concat(_toConsumableArray__default["default"](common), _toConsumableArray__default["default"](additionalA), _toConsumableArray__default["default"](additionalB));
  }, [chainId, tokenA, tokenB]);
  var basePairs = React.useMemo(function () {
    return bases.flatMap(function (base) {
      return bases.map(function (otherBase) {
        return [base, otherBase];
      });
    }) // though redundant with the first filter below, that expression runs more often, so this is probably worthwhile
    .filter(function (_ref3) {
      var _ref4 = _slicedToArray__default["default"](_ref3, 2),
          t0 = _ref4[0],
          t1 = _ref4[1];

      return !t0.equals(t1);
    });
  }, [bases]);
  return React.useMemo(function () {
    return tokenA && tokenB ? [// the direct pair
    [tokenA, tokenB]].concat(_toConsumableArray__default["default"](bases.map(function (base) {
      return [tokenA, base];
    })), _toConsumableArray__default["default"](bases.map(function (base) {
      return [tokenB, base];
    })), _toConsumableArray__default["default"](basePairs)) // filter out invalid pairs comprised of the same asset (e.g. WETH<>WETH)
    .filter(function (_ref5) {
      var _ref6 = _slicedToArray__default["default"](_ref5, 2),
          t0 = _ref6[0],
          t1 = _ref6[1];

      return !t0.equals(t1);
    }) // filter out duplicate pairs
    .filter(function (_ref7, i, otherPairs) {
      var _ref8 = _slicedToArray__default["default"](_ref7, 2),
          t0 = _ref8[0],
          t1 = _ref8[1];

      // find the first index in the array at which there are the same 2 tokens as the current
      var firstIndexInOtherPairs = otherPairs.findIndex(function (_ref9) {
        var _ref10 = _slicedToArray__default["default"](_ref9, 2),
            t0Other = _ref10[0],
            t1Other = _ref10[1];

        return t0.equals(t0Other) && t1.equals(t1Other) || t0.equals(t1Other) && t1.equals(t0Other);
      }); // only accept the first occurrence of the same 2 tokens

      return firstIndexInOtherPairs === i;
    }) // optionally filter out some pairs for tokens with custom bases defined
    .filter(function (_ref11) {
      var _ref12 = _slicedToArray__default["default"](_ref11, 2),
          tokenA = _ref12[0],
          tokenB = _ref12[1];

      if (!chainId) return true;
      var customBases = CUSTOM_BASES[chainId];
      var customBasesA = customBases === null || customBases === void 0 ? void 0 : customBases[tokenA.address];
      var customBasesB = customBases === null || customBases === void 0 ? void 0 : customBases[tokenB.address];
      if (!customBasesA && !customBasesB) return true;
      if (customBasesA && !customBasesA.find(function (base) {
        return tokenB.equals(base);
      })) return false;
      if (customBasesB && !customBasesB.find(function (base) {
        return tokenA.equals(base);
      })) return false;
      return true;
    }) : [];
  }, [tokenA, tokenB, bases, basePairs, chainId]);
}

var PAIR_INTERFACE = new abi$4.Interface(abi$3);
var PairState;

(function (PairState) {
  PairState[PairState["LOADING"] = 0] = "LOADING";
  PairState[PairState["NOT_EXISTS"] = 1] = "NOT_EXISTS";
  PairState[PairState["EXISTS"] = 2] = "EXISTS";
  PairState[PairState["INVALID"] = 3] = "INVALID";
})(PairState || (PairState = {}));

function useV2Pairs(currencies) {
  var tokens = React.useMemo(function () {
    return currencies.map(function (_ref) {
      var _ref2 = _slicedToArray__default["default"](_ref, 2),
          currencyA = _ref2[0],
          currencyB = _ref2[1];

      return [currencyA === null || currencyA === void 0 ? void 0 : currencyA.wrapped, currencyB === null || currencyB === void 0 ? void 0 : currencyB.wrapped];
    });
  }, [currencies]);
  var pairAddresses = React.useMemo(function () {
    return tokens.map(function (_ref3) {
      var _ref4 = _slicedToArray__default["default"](_ref3, 2),
          tokenA = _ref4[0],
          tokenB = _ref4[1];

      return tokenA && tokenB && tokenA.chainId === tokenB.chainId && !tokenA.equals(tokenB) && V2_FACTORY_ADDRESSES[tokenA.chainId] ? v2Sdk.computePairAddress({
        factoryAddress: V2_FACTORY_ADDRESSES[tokenA.chainId],
        tokenA: tokenA,
        tokenB: tokenB
      }) : undefined;
    });
  }, [tokens]);
  var results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');
  return React.useMemo(function () {
    return results.map(function (result, i) {
      var reserves = result.result,
          loading = result.loading;
      var tokenA = tokens[i][0];
      var tokenB = tokens[i][1];
      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      var reserve0 = reserves.reserve0,
          reserve1 = reserves.reserve1;

      var _ref5 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
          _ref6 = _slicedToArray__default["default"](_ref5, 2),
          token0 = _ref6[0],
          token1 = _ref6[1];

      return [PairState.EXISTS, new v2Sdk.Pair(sdkCore.CurrencyAmount.fromRawAmount(token0, reserve0.toString()), sdkCore.CurrencyAmount.fromRawAmount(token1, reserve1.toString()))];
    });
  }, [results, tokens]);
}

function useAllCommonPairs(currencyA, currencyB) {
  var allCurrencyCombinations = useAllCurrencyCombinations(currencyA, currencyB);
  var allPairs = useV2Pairs(allCurrencyCombinations);
  return React.useMemo(function () {
    return Object.values(allPairs // filter out invalid pairs
    .filter(function (result) {
      return Boolean(result[0] === PairState.EXISTS && result[1]);
    }).map(function (_ref) {
      var _ref2 = _slicedToArray__default["default"](_ref, 2),
          pair = _ref2[1];

      return pair;
    }));
  }, [allPairs]);
}

var MAX_HOPS = 3;
/**
 * Returns the best v2 trade for a desired swap
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */

function useBestV2Trade(tradeType, amountSpecified, otherCurrency) {
  var _ref3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      _ref3$maxHops = _ref3.maxHops,
      maxHops = _ref3$maxHops === void 0 ? MAX_HOPS : _ref3$maxHops;

  var _useMemo = React.useMemo(function () {
    return tradeType === sdkCore.TradeType.EXACT_INPUT ? [amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency, otherCurrency] : [otherCurrency, amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency];
  }, [tradeType, amountSpecified, otherCurrency]),
      _useMemo2 = _slicedToArray__default["default"](_useMemo, 2),
      currencyIn = _useMemo2[0],
      currencyOut = _useMemo2[1];

  var allowedPairs = useAllCommonPairs(currencyIn, currencyOut);
  return React.useMemo(function () {
    if (amountSpecified && currencyIn && currencyOut && allowedPairs.length > 0) {
      if (maxHops === 1) {
        var options = {
          maxHops: 1,
          maxNumResults: 1
        };

        if (tradeType === sdkCore.TradeType.EXACT_INPUT) {
          var _Trade$bestTradeExact;

          var amountIn = amountSpecified;
          return (_Trade$bestTradeExact = v2Sdk.Trade.bestTradeExactIn(allowedPairs, amountIn, currencyOut, options)[0]) !== null && _Trade$bestTradeExact !== void 0 ? _Trade$bestTradeExact : null;
        } else {
          var _Trade$bestTradeExact2;

          var amountOut = amountSpecified;
          return (_Trade$bestTradeExact2 = v2Sdk.Trade.bestTradeExactOut(allowedPairs, currencyIn, amountOut, options)[0]) !== null && _Trade$bestTradeExact2 !== void 0 ? _Trade$bestTradeExact2 : null;
        }
      } // search through trades with varying hops, find best trade out of them


      var bestTradeSoFar = null;

      for (var i = 1; i <= maxHops; i++) {
        var _options = {
          maxHops: i,
          maxNumResults: 1
        };
        var currentTrade = void 0;

        if (tradeType === sdkCore.TradeType.EXACT_INPUT) {
          var _Trade$bestTradeExact3;

          var _amountIn = amountSpecified;
          currentTrade = (_Trade$bestTradeExact3 = v2Sdk.Trade.bestTradeExactIn(allowedPairs, _amountIn, currencyOut, _options)[0]) !== null && _Trade$bestTradeExact3 !== void 0 ? _Trade$bestTradeExact3 : null;
        } else {
          var _Trade$bestTradeExact4;

          var _amountOut = amountSpecified;
          currentTrade = (_Trade$bestTradeExact4 = v2Sdk.Trade.bestTradeExactOut(allowedPairs, currencyIn, _amountOut, _options)[0]) !== null && _Trade$bestTradeExact4 !== void 0 ? _Trade$bestTradeExact4 : null;
        } // if current trade is best yet, save it


        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade;
        }
      }

      return bestTradeSoFar;
    }

    return null;
  }, [tradeType, amountSpecified, currencyIn, currencyOut, allowedPairs, maxHops]);
}

var _excluded$2 = ["gasUseEstimateUSD"];

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var TradeState; // from https://github.com/Uniswap/routing-api/blob/main/lib/handlers/schema.ts

(function (TradeState) {
  TradeState[TradeState["LOADING"] = 0] = "LOADING";
  TradeState[TradeState["INVALID"] = 1] = "INVALID";
  TradeState[TradeState["NO_ROUTE_FOUND"] = 2] = "NO_ROUTE_FOUND";
  TradeState[TradeState["VALID"] = 3] = "VALID";
  TradeState[TradeState["SYNCING"] = 4] = "SYNCING";
})(TradeState || (TradeState = {}));

var InterfaceTrade = /*#__PURE__*/function (_Trade) {
  _inherits__default["default"](InterfaceTrade, _Trade);

  var _super = _createSuper$3(InterfaceTrade);

  function InterfaceTrade(_ref) {
    var _this;

    var gasUseEstimateUSD = _ref.gasUseEstimateUSD,
        routes = _objectWithoutProperties__default["default"](_ref, _excluded$2);

    _classCallCheck__default["default"](this, InterfaceTrade);

    _this = _super.call(this, routes);
    _this.gasUseEstimateUSD = gasUseEstimateUSD;
    return _this;
  }

  return _createClass__default["default"](InterfaceTrade);
}(routerSdk.Trade);

var abi = [
	{
		inputs: [
		],
		name: "feeGrowthGlobal0X128",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "feeGrowthGlobal1X128",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "liquidity",
		outputs: [
			{
				internalType: "uint128",
				name: "",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "index",
				type: "uint256"
			}
		],
		name: "observations",
		outputs: [
			{
				internalType: "uint32",
				name: "blockTimestamp",
				type: "uint32"
			},
			{
				internalType: "int56",
				name: "tickCumulative",
				type: "int56"
			},
			{
				internalType: "uint160",
				name: "secondsPerLiquidityCumulativeX128",
				type: "uint160"
			},
			{
				internalType: "bool",
				name: "initialized",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "key",
				type: "bytes32"
			}
		],
		name: "positions",
		outputs: [
			{
				internalType: "uint128",
				name: "_liquidity",
				type: "uint128"
			},
			{
				internalType: "uint256",
				name: "feeGrowthInside0LastX128",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "feeGrowthInside1LastX128",
				type: "uint256"
			},
			{
				internalType: "uint128",
				name: "tokensOwed0",
				type: "uint128"
			},
			{
				internalType: "uint128",
				name: "tokensOwed1",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "protocolFees",
		outputs: [
			{
				internalType: "uint128",
				name: "token0",
				type: "uint128"
			},
			{
				internalType: "uint128",
				name: "token1",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "slot0",
		outputs: [
			{
				internalType: "uint160",
				name: "sqrtPriceX96",
				type: "uint160"
			},
			{
				internalType: "int24",
				name: "tick",
				type: "int24"
			},
			{
				internalType: "uint16",
				name: "observationIndex",
				type: "uint16"
			},
			{
				internalType: "uint16",
				name: "observationCardinality",
				type: "uint16"
			},
			{
				internalType: "uint16",
				name: "observationCardinalityNext",
				type: "uint16"
			},
			{
				internalType: "uint8",
				name: "feeProtocol",
				type: "uint8"
			},
			{
				internalType: "bool",
				name: "unlocked",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "int16",
				name: "wordPosition",
				type: "int16"
			}
		],
		name: "tickBitmap",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "int24",
				name: "tick",
				type: "int24"
			}
		],
		name: "ticks",
		outputs: [
			{
				internalType: "uint128",
				name: "liquidityGross",
				type: "uint128"
			},
			{
				internalType: "int128",
				name: "liquidityNet",
				type: "int128"
			},
			{
				internalType: "uint256",
				name: "feeGrowthOutside0X128",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "feeGrowthOutside1X128",
				type: "uint256"
			},
			{
				internalType: "int56",
				name: "tickCumulativeOutside",
				type: "int56"
			},
			{
				internalType: "uint160",
				name: "secondsPerLiquidityOutsideX128",
				type: "uint160"
			},
			{
				internalType: "uint32",
				name: "secondsOutside",
				type: "uint32"
			},
			{
				internalType: "bool",
				name: "initialized",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

var POOL_STATE_INTERFACE = new abi$4.Interface(abi); // Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.

var PoolCache = /*#__PURE__*/function () {
  function PoolCache() {
    _classCallCheck__default["default"](this, PoolCache);
  }

  _createClass__default["default"](PoolCache, null, [{
    key: "getPoolAddress",
    value: // Evict after 128 entries. Empirically, a swap uses 64 entries.
    // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
    function getPoolAddress(factoryAddress, tokenA, tokenB, fee) {
      if (this.addresses.length > this.MAX_ENTRIES) {
        this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2);
      }

      var addressA = tokenA.address;
      var addressB = tokenB.address;
      var key = "".concat(factoryAddress, ":").concat(addressA, ":").concat(addressB, ":").concat(fee.toString());
      var found = this.addresses.find(function (address) {
        return address.key === key;
      });
      if (found) return found.address;
      var address = {
        key: key,
        address: v3Sdk.computePoolAddress({
          factoryAddress: factoryAddress,
          tokenA: tokenA,
          tokenB: tokenB,
          fee: fee
        })
      };
      this.addresses.unshift(address);
      return address.address;
    }
  }, {
    key: "getPool",
    value: function getPool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick) {
      if (this.pools.length > this.MAX_ENTRIES) {
        this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2);
      }

      var found = this.pools.find(function (pool) {
        return pool.token0 === tokenA && pool.token1 === tokenB && pool.fee === fee && JSBI__default["default"].EQ(pool.sqrtRatioX96, sqrtPriceX96) && JSBI__default["default"].EQ(pool.liquidity, liquidity) && pool.tickCurrent === tick;
      });
      if (found) return found;
      var pool = new v3Sdk.Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick);
      this.pools.unshift(pool);
      return pool;
    }
  }]);

  return PoolCache;
}();

_defineProperty__default["default"](PoolCache, "MAX_ENTRIES", 128);

_defineProperty__default["default"](PoolCache, "pools", []);

_defineProperty__default["default"](PoolCache, "addresses", []);

var PoolState;

(function (PoolState) {
  PoolState[PoolState["LOADING"] = 0] = "LOADING";
  PoolState[PoolState["NOT_EXISTS"] = 1] = "NOT_EXISTS";
  PoolState[PoolState["EXISTS"] = 2] = "EXISTS";
  PoolState[PoolState["INVALID"] = 3] = "INVALID";
})(PoolState || (PoolState = {}));

function usePools(poolKeys) {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var poolTokens = React.useMemo(function () {
    if (!chainId) return new Array(poolKeys.length);
    return poolKeys.map(function (_ref) {
      var _ref2 = _slicedToArray__default["default"](_ref, 3),
          currencyA = _ref2[0],
          currencyB = _ref2[1],
          feeAmount = _ref2[2];

      if (currencyA && currencyB && feeAmount) {
        var tokenA = currencyA.wrapped;
        var tokenB = currencyB.wrapped;
        if (tokenA.equals(tokenB)) return undefined;
        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount];
      }

      return undefined;
    });
  }, [chainId, poolKeys]);
  var poolAddresses = React.useMemo(function () {
    var v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId];
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);
    return poolTokens.map(function (value) {
      return value && PoolCache.getPoolAddress.apply(PoolCache, [v3CoreFactoryAddress].concat(_toConsumableArray__default["default"](value)));
    });
  }, [chainId, poolTokens]);
  var slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0');
  var liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity');
  return React.useMemo(function () {
    return poolKeys.map(function (_key, index) {
      var tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];

      var _tokens = _slicedToArray__default["default"](tokens, 3),
          token0 = _tokens[0],
          token1 = _tokens[1],
          fee = _tokens[2];

      if (!slot0s[index]) return [PoolState.INVALID, null];
      var _slot0s$index = slot0s[index],
          slot0 = _slot0s$index.result,
          slot0Loading = _slot0s$index.loading,
          slot0Valid = _slot0s$index.valid;
      if (!liquidities[index]) return [PoolState.INVALID, null];
      var _liquidities$index = liquidities[index],
          liquidity = _liquidities$index.result,
          liquidityLoading = _liquidities$index.loading,
          liquidityValid = _liquidities$index.valid;
      if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null];
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null];
      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null];

      try {
        var pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick);
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [liquidities, poolKeys, slot0s, poolTokens]);
}

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */

function useV3SwapPools(currencyIn, currencyOut) {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut);
  var allCurrencyCombinationsWithAllFees = React.useMemo(function () {
    return allCurrencyCombinations.reduce(function (list, _ref) {
      var _ref2 = _slicedToArray__default["default"](_ref, 2),
          tokenA = _ref2[0],
          tokenB = _ref2[1];

      return chainId === exports.SupportedChainId.MAINNET ? list.concat([[tokenA, tokenB, v3Sdk.FeeAmount.LOW], [tokenA, tokenB, v3Sdk.FeeAmount.MEDIUM], [tokenA, tokenB, v3Sdk.FeeAmount.HIGH]]) : list.concat([[tokenA, tokenB, v3Sdk.FeeAmount.LOWEST], [tokenA, tokenB, v3Sdk.FeeAmount.LOW], [tokenA, tokenB, v3Sdk.FeeAmount.MEDIUM], [tokenA, tokenB, v3Sdk.FeeAmount.HIGH]]);
    }, []);
  }, [allCurrencyCombinations, chainId]);
  var pools = usePools(allCurrencyCombinationsWithAllFees);
  return React.useMemo(function () {
    return {
      pools: pools.filter(function (tuple) {
        return tuple[0] === PoolState.EXISTS && tuple[1] !== null;
      }).map(function (_ref3) {
        var _ref4 = _slicedToArray__default["default"](_ref3, 2),
            pool = _ref4[1];

        return pool;
      }),
      loading: pools.some(function (_ref5) {
        var _ref6 = _slicedToArray__default["default"](_ref5, 1),
            state = _ref6[0];

        return state === PoolState.LOADING;
      })
    };
  }, [pools]);
}

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */

function poolEquals(poolA, poolB) {
  return poolA === poolB || poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee;
}

function computeAllRoutes(currencyIn, currencyOut, pools, chainId) {
  var currentPath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var allPaths = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
  var startCurrencyIn = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : currencyIn;
  var maxHops = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 2;
  var tokenIn = currencyIn === null || currencyIn === void 0 ? void 0 : currencyIn.wrapped;
  var tokenOut = currencyOut === null || currencyOut === void 0 ? void 0 : currencyOut.wrapped;
  if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut');

  var _iterator = _createForOfIteratorHelper$1(pools),
      _step;

  try {
    var _loop = function _loop() {
      var pool = _step.value;
      if (!pool.involvesToken(tokenIn) || currentPath.find(function (pathPool) {
        return poolEquals(pool, pathPool);
      })) return "continue";
      var outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;

      if (outputToken.equals(tokenOut)) {
        allPaths.push(new v3Sdk.Route([].concat(_toConsumableArray__default["default"](currentPath), [pool]), startCurrencyIn, currencyOut));
      } else if (maxHops > 1) {
        computeAllRoutes(outputToken, currencyOut, pools, chainId, [].concat(_toConsumableArray__default["default"](currentPath), [pool]), allPaths, startCurrencyIn, maxHops - 1);
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();

      if (_ret === "continue") continue;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return allPaths;
}
/**
 * Returns all the routes from an input currency to an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */


function useAllV3Routes(currencyIn, currencyOut) {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var _useV3SwapPools = useV3SwapPools(currencyIn, currencyOut),
      pools = _useV3SwapPools.pools,
      poolsLoading = _useV3SwapPools.loading;

  return React.useMemo(function () {
    if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut) return {
      loading: true,
      routes: []
    };
    var routes = computeAllRoutes(currencyIn, currencyOut, pools, chainId, [], [], currencyIn, 2);
    return {
      loading: false,
      routes: routes
    };
  }, [chainId, currencyIn, currencyOut, pools, poolsLoading]);
}

var _QUOTE_GAS_OVERRIDES;
var QUOTE_GAS_OVERRIDES = (_QUOTE_GAS_OVERRIDES = {}, _defineProperty__default["default"](_QUOTE_GAS_OVERRIDES, exports.SupportedChainId.ARBITRUM_ONE, 25000000), _defineProperty__default["default"](_QUOTE_GAS_OVERRIDES, exports.SupportedChainId.ARBITRUM_RINKEBY, 25000000), _QUOTE_GAS_OVERRIDES);
var DEFAULT_GAS_QUOTE = 2000000;
/**
 * Returns the best v3 trade for a desired swap
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */

function useClientSideV3Trade(tradeType, amountSpecified, otherCurrency) {
  var _QUOTE_GAS_OVERRIDES$;

  var _ref = tradeType === sdkCore.TradeType.EXACT_INPUT ? [amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency, otherCurrency] : [otherCurrency, amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency],
      _ref2 = _slicedToArray__default["default"](_ref, 2),
      currencyIn = _ref2[0],
      currencyOut = _ref2[1];

  var _useAllV3Routes = useAllV3Routes(currencyIn, currencyOut),
      routes = _useAllV3Routes.routes,
      routesLoading = _useAllV3Routes.loading;

  var quoter = useV3Quoter();

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var callData = React.useMemo(function () {
    return amountSpecified ? routes.map(function (route) {
      return v3Sdk.SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType).calldata;
    }) : [];
  }, [amountSpecified, routes, tradeType]);
  var quotesResults = useSingleContractWithCallData(quoter, callData, {
    gasRequired: chainId ? (_QUOTE_GAS_OVERRIDES$ = QUOTE_GAS_OVERRIDES[chainId]) !== null && _QUOTE_GAS_OVERRIDES$ !== void 0 ? _QUOTE_GAS_OVERRIDES$ : DEFAULT_GAS_QUOTE : undefined
  });
  return React.useMemo(function () {
    if (!amountSpecified || !currencyIn || !currencyOut || quotesResults.some(function (_ref3) {
      var valid = _ref3.valid;
      return !valid;
    }) || ( // skip when tokens are the same
    tradeType === sdkCore.TradeType.EXACT_INPUT ? amountSpecified.currency.equals(currencyOut) : amountSpecified.currency.equals(currencyIn))) {
      return {
        state: TradeState.INVALID,
        trade: undefined
      };
    }

    if (routesLoading || quotesResults.some(function (_ref4) {
      var loading = _ref4.loading;
      return loading;
    })) {
      return {
        state: TradeState.LOADING,
        trade: undefined
      };
    }

    var _quotesResults$reduce = quotesResults.reduce(function (currentBest, _ref5, i) {
      var result = _ref5.result;
      if (!result) return currentBest; // overwrite the current best if it's not defined or if this route is better

      // overwrite the current best if it's not defined or if this route is better
      if (tradeType === sdkCore.TradeType.EXACT_INPUT) {
        var _amountOut = sdkCore.CurrencyAmount.fromRawAmount(currencyOut, result.amountOut.toString());

        if (currentBest.amountOut === null || JSBI__default["default"].lessThan(currentBest.amountOut.quotient, _amountOut.quotient)) {
          return {
            bestRoute: routes[i],
            amountIn: amountSpecified,
            amountOut: _amountOut
          };
        }
      } else {
        var _amountIn = sdkCore.CurrencyAmount.fromRawAmount(currencyIn, result.amountIn.toString());

        if (currentBest.amountIn === null || JSBI__default["default"].greaterThan(currentBest.amountIn.quotient, _amountIn.quotient)) {
          return {
            bestRoute: routes[i],
            amountIn: _amountIn,
            amountOut: amountSpecified
          };
        }
      }

      return currentBest;
    }, {
      bestRoute: null,
      amountIn: null,
      amountOut: null
    }),
        bestRoute = _quotesResults$reduce.bestRoute,
        amountIn = _quotesResults$reduce.amountIn,
        amountOut = _quotesResults$reduce.amountOut;

    if (!bestRoute || !amountIn || !amountOut) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined
      };
    }

    return {
      state: TradeState.VALID,
      trade: new InterfaceTrade({
        v2Routes: [],
        v3Routes: [{
          routev3: bestRoute,
          inputAmount: amountIn,
          outputAmount: amountOut
        }],
        tradeType: tradeType
      })
    };
  }, [amountSpecified, currencyIn, currencyOut, quotesResults, routes, routesLoading, tradeType]);
}

var _STABLECOIN_AMOUNT_OU;
// The amount is large enough to filter low liquidity pairs.

var STABLECOIN_AMOUNT_OUT = (_STABLECOIN_AMOUNT_OU = {}, _defineProperty__default["default"](_STABLECOIN_AMOUNT_OU, exports.SupportedChainId.MAINNET, sdkCore.CurrencyAmount.fromRawAmount(USDC_MAINNET, 100000e6)), _defineProperty__default["default"](_STABLECOIN_AMOUNT_OU, exports.SupportedChainId.ARBITRUM_ONE, sdkCore.CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10000e6)), _defineProperty__default["default"](_STABLECOIN_AMOUNT_OU, exports.SupportedChainId.OPTIMISM, sdkCore.CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10000e18)), _defineProperty__default["default"](_STABLECOIN_AMOUNT_OU, exports.SupportedChainId.POLYGON, sdkCore.CurrencyAmount.fromRawAmount(USDC_POLYGON, 10000e6)), _STABLECOIN_AMOUNT_OU);
/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */

function useUSDCPrice(currency) {
  var chainId = currency === null || currency === void 0 ? void 0 : currency.chainId;
  var amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined;
  var stablecoin = amountOut === null || amountOut === void 0 ? void 0 : amountOut.currency; // TODO(#2808): remove dependency on useBestV2Trade

  var v2USDCTrade = useBestV2Trade(sdkCore.TradeType.EXACT_OUTPUT, amountOut, currency, {
    maxHops: 2
  });
  var v3USDCTrade = useClientSideV3Trade(sdkCore.TradeType.EXACT_OUTPUT, amountOut, currency);
  var price = React.useMemo(function () {
    if (!currency || !stablecoin) {
      return undefined;
    } // handle usdc


    if (currency !== null && currency !== void 0 && currency.wrapped.equals(stablecoin)) {
      return new sdkCore.Price(stablecoin, stablecoin, '1', '1');
    } // use v2 price if available, v3 as fallback


    if (v2USDCTrade) {
      var _v2USDCTrade$route$mi = v2USDCTrade.route.midPrice,
          numerator = _v2USDCTrade$route$mi.numerator,
          denominator = _v2USDCTrade$route$mi.denominator;
      return new sdkCore.Price(currency, stablecoin, denominator, numerator);
    } else if (v3USDCTrade.trade) {
      var _v3USDCTrade$trade$ro = v3USDCTrade.trade.routes[0].midPrice,
          _numerator = _v3USDCTrade$trade$ro.numerator,
          _denominator = _v3USDCTrade$trade$ro.denominator;
      return new sdkCore.Price(currency, stablecoin, _denominator, _numerator);
    }

    return undefined;
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade]);
  var lastPrice = React.useRef(price);

  if (!price || !lastPrice.current || !price.equalTo(lastPrice.current)) {
    lastPrice.current = price;
  }

  return lastPrice.current;
}
function useUSDCValue(currencyAmount) {
  var price = useUSDCPrice(currencyAmount === null || currencyAmount === void 0 ? void 0 : currencyAmount.currency);
  return React.useMemo(function () {
    if (!price || !currencyAmount) return null;

    try {
      return price.quote(currencyAmount);
    } catch (error) {
      return null;
    }
  }, [currencyAmount, price]);
}
/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */

function useStablecoinAmountFromFiatValue(fiatValue) {
  var _STABLECOIN_AMOUNT_OU2;

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var stablecoin = chainId ? (_STABLECOIN_AMOUNT_OU2 = STABLECOIN_AMOUNT_OUT[chainId]) === null || _STABLECOIN_AMOUNT_OU2 === void 0 ? void 0 : _STABLECOIN_AMOUNT_OU2.currency : undefined;
  return React.useMemo(function () {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined;
    } // trim for decimal precision when parsing


    var parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString();

    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin);
    } catch (error) {
      return undefined;
    }
  }, [chainId, fiatValue, stablecoin]);
}

var V3_SWAP_DEFAULT_SLIPPAGE = new sdkCore.Percent(50, 10000); // .50%

var ONE_TENTHS_PERCENT = new sdkCore.Percent(10, 10000); // .10%

var DEFAULT_AUTO_SLIPPAGE = ONE_TENTHS_PERCENT;
/**
 * Return a guess of the gas cost used in computing slippage tolerance for a given trade
 * @param trade the trade for which to _guess_ the amount of gas it would cost to execute
 */

function guesstimateGas(trade) {
  if (!!trade) {
    return 100000 + trade.swaps.reduce(function (memo, swap) {
      return swap.route.pools.length + memo;
    }, 0) * 30000;
  }

  return undefined;
}

var MIN_AUTO_SLIPPAGE_TOLERANCE = new sdkCore.Percent(5, 1000); // 0.5%

var MAX_AUTO_SLIPPAGE_TOLERANCE = new sdkCore.Percent(25, 100); // 25%

/**
 * Returns slippage tolerance based on values from current trade, gas estimates from api, and active network.
 */

function useAutoSlippageTolerance(trade) {
  var _ref;

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var onL2 = chainId && L2_CHAIN_IDS.includes(chainId);
  var outputDollarValue = useUSDCValue(trade === null || trade === void 0 ? void 0 : trade.outputAmount);
  var nativeGasPrice = useGasPrice();
  var gasEstimate = guesstimateGas(trade);
  var nativeCurrency = useNativeCurrency();
  var nativeCurrencyPrice = useUSDCPrice((_ref = trade && nativeCurrency) !== null && _ref !== void 0 ? _ref : undefined);
  return React.useMemo(function () {
    if (!trade || onL2) return DEFAULT_AUTO_SLIPPAGE;
    var nativeGasCost = nativeGasPrice && typeof gasEstimate === 'number' ? JSBI__default["default"].multiply(nativeGasPrice, JSBI__default["default"].BigInt(gasEstimate)) : undefined;
    var dollarGasCost = nativeCurrency && nativeGasCost && nativeCurrencyPrice ? nativeCurrencyPrice.quote(sdkCore.CurrencyAmount.fromRawAmount(nativeCurrency, nativeGasCost)) : undefined; // if valid estimate from api and using api trade, use gas estimate from api
    // NOTE - dont use gas estimate for L2s yet - need to verify accuracy
    // if not, use local heuristic

    var dollarCostToUse = chainId && SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) && trade !== null && trade !== void 0 && trade.gasUseEstimateUSD ? trade.gasUseEstimateUSD : dollarGasCost;

    if (outputDollarValue && dollarCostToUse) {
      // the rationale is that a user will not want their trade to fail for a loss due to slippage that is less than
      // the cost of the gas of the failed transaction
      var fraction = dollarCostToUse.asFraction.divide(outputDollarValue.asFraction);
      var result = new sdkCore.Percent(fraction.numerator, fraction.denominator);
      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE)) return MAX_AUTO_SLIPPAGE_TOLERANCE;
      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE)) return MIN_AUTO_SLIPPAGE_TOLERANCE;
      return result;
    }

    return V3_SWAP_DEFAULT_SLIPPAGE;
  }, [trade, onL2, nativeGasPrice, gasEstimate, nativeCurrency, nativeCurrencyPrice, chainId, outputDollarValue]);
}

/* eslint-disable @typescript-eslint/ban-types */
/**
 * Creates a derived atom whose value is the picked object property.
 * By default, the setter acts as a primitive atom's, changing the original atom.
 * A custom setter may also be passed, which uses an Immer Draft so that it may be mutated directly.
 */

function pickAtom(anAtom, key) {
  var setter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (draft, update) {
    return update;
  };
  return jotai.atom(function (get) {
    return get(anAtom)[key];
  }, function (get, set, update) {
    return set(immer.withImmer(anAtom), function (value) {
      var derived = setter(value[key], update);
      value[key] = derived;
    });
  });
}
/** Sets a togglable atom to invert its state at the next render. */

function setTogglable(draft) {
  return !draft;
}

var initialSettings = {
  autoSlippage: true,
  maxSlippage: undefined,
  transactionTtl: undefined,
  mockTogglable: true,
  clientSideRouter: false
};
var settingsAtom = utils.atomWithReset(initialSettings);
var autoSlippageAtom = pickAtom(settingsAtom, 'autoSlippage');
var maxSlippageAtom = pickAtom(settingsAtom, 'maxSlippage');
pickAtom(settingsAtom, 'transactionTtl');
pickAtom(settingsAtom, 'mockTogglable', setTogglable);
pickAtom(settingsAtom, 'clientSideRouter');

function toPercent(maxSlippage) {
  if (!maxSlippage) return undefined;
  var numerator = Math.floor(maxSlippage * 100);
  return new sdkCore.Percent(numerator, 10000);
}
var DEFAULT_SLIPPAGE = {
  auto: true,
  allowed: DEFAULT_AUTO_SLIPPAGE
};
/** Returns the allowed slippage, and whether it is auto-slippage. */

function useSlippage(trade) {
  var shouldUseAutoSlippage = utils.useAtomValue(autoSlippageAtom);
  var autoSlippage = useAutoSlippageTolerance(shouldUseAutoSlippage ? trade : undefined);
  var maxSlippageValue = utils.useAtomValue(maxSlippageAtom);
  var maxSlippage = React.useMemo(function () {
    return toPercent(maxSlippageValue);
  }, [maxSlippageValue]);
  return React.useMemo(function () {
    var auto = shouldUseAutoSlippage || !maxSlippage;
    var allowed = shouldUseAutoSlippage ? autoSlippage : maxSlippage !== null && maxSlippage !== void 0 ? maxSlippage : autoSlippage;
    var warning = auto ? undefined : getSlippageWarning(allowed);

    if (auto && allowed === DEFAULT_AUTO_SLIPPAGE) {
      return DEFAULT_SLIPPAGE;
    }

    return {
      auto: auto,
      allowed: allowed,
      warning: warning
    };
  }, [autoSlippage, maxSlippage, shouldUseAutoSlippage]);
}
var MAX_VALID_SLIPPAGE = new sdkCore.Percent(1, 2);
var MIN_HIGH_SLIPPAGE = new sdkCore.Percent(1, 100);
function getSlippageWarning(slippage) {
  if (slippage !== null && slippage !== void 0 && slippage.greaterThan(MAX_VALID_SLIPPAGE)) return 'error';
  if (slippage !== null && slippage !== void 0 && slippage.greaterThan(MIN_HIGH_SLIPPAGE)) return 'warning';
  return;
}

function computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput) {
  if (!fiatValueOutput || !fiatValueInput) return undefined;
  if (!fiatValueInput.currency.equals(fiatValueOutput.currency)) return undefined;
  if (JSBI__default["default"].equal(fiatValueInput.quotient, JSBI__default["default"].BigInt(0))) return undefined;
  var pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput));
  return new sdkCore.Percent(pct.numerator, pct.denominator);
}

var THIRTY_BIPS_FEE = new sdkCore.Percent(JSBI__default["default"].BigInt(30), JSBI__default["default"].BigInt(10000));
ONE_HUNDRED_PERCENT.subtract(THIRTY_BIPS_FEE);
function getPriceImpactWarning(priceImpact) {
  if (priceImpact !== null && priceImpact !== void 0 && priceImpact.greaterThan(ALLOWED_PRICE_IMPACT_HIGH)) return 'error';
  if (priceImpact !== null && priceImpact !== void 0 && priceImpact.greaterThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 'warning';
  return;
} // computes realized lp fee as a percent

/**
 * Computes input/output USDC equivalents and the price impact.
 * Returns the price impact as a human readable string.
 */
function useUSDCPriceImpact(inputAmount, outputAmount) {
  var _useUSDCValue, _useUSDCValue2;

  var inputUSDC = (_useUSDCValue = useUSDCValue(inputAmount)) !== null && _useUSDCValue !== void 0 ? _useUSDCValue : undefined;
  var outputUSDC = (_useUSDCValue2 = useUSDCValue(outputAmount)) !== null && _useUSDCValue2 !== void 0 ? _useUSDCValue2 : undefined;
  return React.useMemo(function () {
    var priceImpact = computeFiatValuePriceImpact(inputUSDC, outputUSDC);
    var impact = priceImpact ? {
      percent: priceImpact,
      warning: getPriceImpactWarning(priceImpact),
      toString: function toString() {
        return toHumanReadablePriceImpact(priceImpact);
      }
    } : undefined;
    return {
      inputUSDC: inputUSDC,
      outputUSDC: outputUSDC,
      impact: impact
    };
  }, [inputUSDC, outputUSDC]);
}

function toHumanReadablePriceImpact(priceImpact) {
  var _priceImpact$multiply;

  var sign = priceImpact.lessThan(0) ? '+' : '';
  var number = parseFloat((_priceImpact$multiply = priceImpact.multiply(-1)) === null || _priceImpact$multiply === void 0 ? void 0 : _priceImpact$multiply.toSignificant(3));
  return "".concat(sign).concat(number, "%");
}

var Field;

(function (Field) {
  Field["INPUT"] = "INPUT";
  Field["OUTPUT"] = "OUTPUT";
})(Field || (Field = {}));

var swapAtom = immer.atomWithImmer(_defineProperty__default["default"]({
  independentField: Field.INPUT,
  amount: ''
}, Field.INPUT, nativeOnChain(exports.SupportedChainId.MAINNET))); // If set to a transaction hash, that transaction will display in a status dialog.

jotai.atom(undefined);
var feeOptionsAtom = jotai.atom(undefined);

/**
 * Returns the last value of type T that passes a filter function
 * @param value changing value
 * @param filterFn function that determines whether a given value should be considered for the last value
 */

function useLast(value, filterFn) {
  var _useState = React.useState(filterFn && filterFn(value) ? value : undefined),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      last = _useState2[0],
      setLast = _useState2[1];

  React.useEffect(function () {
    setLast(function (last) {
      var shouldUse = filterFn ? filterFn(value) : true;
      if (shouldUse) return value;
      return last;
    });
  }, [filterFn, value]);
  return last;
}

/**
 * Transforms a Routing API quote into an array of routes that can be used to create
 * a `Trade`.
 */

function computeRoutes(currencyIn, currencyOut, tradeType, quoteResult) {
  if (!quoteResult || !quoteResult.route || !currencyIn || !currencyOut) return undefined;
  if (quoteResult.route.length === 0) return [];
  var parsedTokenIn = parseToken(quoteResult.route[0][0].tokenIn);
  var parsedTokenOut = parseToken(quoteResult.route[0][quoteResult.route[0].length - 1].tokenOut);
  if (parsedTokenIn.address !== currencyIn.wrapped.address) return undefined;
  if (parsedTokenOut.address !== currencyOut.wrapped.address) return undefined;
  var parsedCurrencyIn = currencyIn.isNative ? nativeOnChain(currencyIn.chainId) : parsedTokenIn;
  var parsedCurrencyOut = currencyOut.isNative ? nativeOnChain(currencyOut.chainId) : parsedTokenOut;

  try {
    return quoteResult.route.map(function (route) {
      if (route.length === 0) {
        throw new Error('Expected route to have at least one pair or pool');
      }

      var rawAmountIn = route[0].amountIn;
      var rawAmountOut = route[route.length - 1].amountOut;

      if (!rawAmountIn || !rawAmountOut) {
        throw new Error('Expected both amountIn and amountOut to be present');
      }

      return {
        routev3: isV3Route(route) ? new v3Sdk.Route(route.map(parsePool), parsedCurrencyIn, parsedCurrencyOut) : null,
        routev2: !isV3Route(route) ? new v2Sdk.Route(route.map(parsePair), parsedCurrencyIn, parsedCurrencyOut) : null,
        inputAmount: sdkCore.CurrencyAmount.fromRawAmount(parsedCurrencyIn, rawAmountIn),
        outputAmount: sdkCore.CurrencyAmount.fromRawAmount(parsedCurrencyOut, rawAmountOut)
      };
    });
  } catch (e) {
    // `Route` constructor may throw if inputs/outputs are temporarily out of sync
    // (RTK-Query always returns the latest data which may not be the right inputs/outputs)
    // This is not fatal and will fix itself in future render cycles
    console.error(e);
    return undefined;
  }
}
function transformRoutesToTrade(route, tradeType, gasUseEstimateUSD) {
  var _route$filter$map, _route$filter$map2;

  return new InterfaceTrade({
    v2Routes: (_route$filter$map = route === null || route === void 0 ? void 0 : route.filter(function (r) {
      return r.routev2 !== null;
    }).map(function (_ref) {
      var routev2 = _ref.routev2,
          inputAmount = _ref.inputAmount,
          outputAmount = _ref.outputAmount;
      return {
        routev2: routev2,
        inputAmount: inputAmount,
        outputAmount: outputAmount
      };
    })) !== null && _route$filter$map !== void 0 ? _route$filter$map : [],
    v3Routes: (_route$filter$map2 = route === null || route === void 0 ? void 0 : route.filter(function (r) {
      return r.routev3 !== null;
    }).map(function (_ref2) {
      var routev3 = _ref2.routev3,
          inputAmount = _ref2.inputAmount,
          outputAmount = _ref2.outputAmount;
      return {
        routev3: routev3,
        inputAmount: inputAmount,
        outputAmount: outputAmount
      };
    })) !== null && _route$filter$map2 !== void 0 ? _route$filter$map2 : [],
    tradeType: tradeType,
    gasUseEstimateUSD: gasUseEstimateUSD
  });
}

var parseToken = function parseToken(_ref3) {
  var address = _ref3.address,
      chainId = _ref3.chainId,
      decimals = _ref3.decimals,
      symbol = _ref3.symbol;
  return new sdkCore.Token(chainId, address, parseInt(decimals.toString()), symbol);
};

var parsePool = function parsePool(_ref4) {
  var fee = _ref4.fee,
      sqrtRatioX96 = _ref4.sqrtRatioX96,
      liquidity = _ref4.liquidity,
      tickCurrent = _ref4.tickCurrent,
      tokenIn = _ref4.tokenIn,
      tokenOut = _ref4.tokenOut;
  return new v3Sdk.Pool(parseToken(tokenIn), parseToken(tokenOut), parseInt(fee), sqrtRatioX96, liquidity, parseInt(tickCurrent));
};

var parsePair = function parsePair(_ref5) {
  var reserve0 = _ref5.reserve0,
      reserve1 = _ref5.reserve1;
  return new v2Sdk.Pair(sdkCore.CurrencyAmount.fromRawAmount(parseToken(reserve0.token), reserve0.quotient), sdkCore.CurrencyAmount.fromRawAmount(parseToken(reserve1.token), reserve1.quotient));
};

function isV3Route(route) {
  return route[0].type === 'v3-pool';
}

var WrapType;

(function (WrapType) {
  WrapType[WrapType["NONE"] = 0] = "NONE";
  WrapType[WrapType["WRAP"] = 1] = "WRAP";
  WrapType[WrapType["UNWRAP"] = 2] = "UNWRAP";
})(WrapType || (WrapType = {}));

function useWrapCallback() {
  var _useActiveWeb3React = useActiveWeb3React(),
      account = _useActiveWeb3React.account,
      chainId = _useActiveWeb3React.chainId;

  var wrappedNativeCurrencyContract = useWETHContract();

  var _useAtomValue = utils.useAtomValue(swapAtom),
      amount = _useAtomValue.amount,
      inputCurrency = _useAtomValue[Field.INPUT],
      outputCurrency = _useAtomValue[Field.OUTPUT];

  var wrapType = React.useMemo(function () {
    if (chainId && inputCurrency && outputCurrency) {
      var _WRAPPED_NATIVE_CURRE, _WRAPPED_NATIVE_CURRE2;

      if (inputCurrency.isNative && (_WRAPPED_NATIVE_CURRE = WRAPPED_NATIVE_CURRENCY[chainId]) !== null && _WRAPPED_NATIVE_CURRE !== void 0 && _WRAPPED_NATIVE_CURRE.equals(outputCurrency)) {
        return WrapType.WRAP;
      }

      if (outputCurrency.isNative && (_WRAPPED_NATIVE_CURRE2 = WRAPPED_NATIVE_CURRENCY[chainId]) !== null && _WRAPPED_NATIVE_CURRE2 !== void 0 && _WRAPPED_NATIVE_CURRE2.equals(inputCurrency)) {
        return WrapType.UNWRAP;
      }
    }

    return WrapType.NONE;
  }, [chainId, inputCurrency, outputCurrency]);
  var parsedAmountIn = React.useMemo(function () {
    return tryParseCurrencyAmount(amount, inputCurrency !== null && inputCurrency !== void 0 ? inputCurrency : undefined);
  }, [inputCurrency, amount]);
  var balanceIn = useCurrencyBalance(account, inputCurrency);
  var callback = React.useMemo(function () {
    if (wrapType === WrapType.NONE || !parsedAmountIn || !balanceIn || balanceIn.lessThan(parsedAmountIn) || !wrappedNativeCurrencyContract) {
      return;
    }

    return /*#__PURE__*/_asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
      return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", wrapType === WrapType.WRAP ? wrappedNativeCurrencyContract.deposit({
                value: "0x".concat(parsedAmountIn.quotient.toString(16))
              }) : wrappedNativeCurrencyContract.withdraw("0x".concat(parsedAmountIn.quotient.toString(16))));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
  }, [wrapType, parsedAmountIn, balanceIn, wrappedNativeCurrencyContract]);
  return React.useMemo(function () {
    return {
      callback: callback,
      type: wrapType
    };
  }, [callback, wrapType]);
}

var oldestBlockMapAtom = immer.atomWithImmer({});
var DEFAULT_MAX_BLOCK_AGE = 10;
function useGetIsValidBlock() {
  var maxBlockAge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_MAX_BLOCK_AGE;

  var _useActiveWeb3React2 = useActiveWeb3React(),
      chainId = _useActiveWeb3React2.chainId;

  var currentBlock = useBlockNumber();
  var oldestBlockMap = utils.useAtomValue(oldestBlockMapAtom);
  var oldestBlock = chainId ? oldestBlockMap[chainId] : 0;
  return React.useCallback(function (block) {
    if (!currentBlock) return false;
    if (currentBlock - block > maxBlockAge) return false;
    if (currentBlock < oldestBlock) return false;
    return true;
  }, [currentBlock, maxBlockAge, oldestBlock]);
}

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$6(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var DEFAULT_POLLING_INTERVAL = 15000;
var DEFAULT_KEEP_UNUSED_DATA_FOR = 10000;
function usePoll(fetch) {
  var _cache$get;

  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var _ref = arguments.length > 2 ? arguments[2] : undefined,
      _ref$debounce = _ref.debounce,
      debounce = _ref$debounce === void 0 ? false : _ref$debounce,
      isStale = _ref.isStale,
      _ref$pollingInterval = _ref.pollingInterval,
      pollingInterval = _ref$pollingInterval === void 0 ? DEFAULT_POLLING_INTERVAL : _ref$pollingInterval,
      _ref$keepUnusedDataFo = _ref.keepUnusedDataFor,
      keepUnusedDataFor = _ref$keepUnusedDataFo === void 0 ? DEFAULT_KEEP_UNUSED_DATA_FOR : _ref$keepUnusedDataFo;

  var cache = React.useMemo(function () {
    return new Map();
  }, []);

  var _useState = React.useState({
    key: key
  }),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      setData = _useState2[1];

  React.useEffect(function () {
    if (debounce) return;
    var timeout;
    var entry = cache.get(key);

    if (entry) {
      // If there is not a pending fetch (and there should be), queue one.
      if (entry.ttl) {
        if (isStale && (entry === null || entry === void 0 ? void 0 : entry.result) !== undefined ? isStale(entry.result) : false) {
          poll(); // stale results should be refetched immediately
        } else if (entry.ttl && entry.ttl + keepUnusedDataFor > Date.now()) {
          timeout = setTimeout(poll, Math.max(0, entry.ttl - Date.now()));
        }
      }
    } else {
      // If there is no cached entry, trigger a poll immediately.
      poll();
    }

    setData({
      key: key,
      result: entry === null || entry === void 0 ? void 0 : entry.result
    });
    return function () {
      clearTimeout(timeout);
      timeout = 0;
    };

    function poll() {
      return _poll.apply(this, arguments);
    }

    function _poll() {
      _poll = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
        var ttl,
            result,
            _args = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                ttl = _args.length > 0 && _args[0] !== undefined ? _args[0] : Date.now() + pollingInterval;
                timeout = setTimeout(poll, pollingInterval); // queue the next poll

                cache.set(key, _objectSpread$6({
                  ttl: null
                }, cache.get(key))); // mark the entry as a pending fetch
                // Always set the result in the cache, but only set it as data if the key is still being queried.

                _context.next = 5;
                return fetch();

              case 5:
                result = _context.sent;
                cache.set(key, {
                  ttl: ttl,
                  result: result
                });
                if (timeout) setData(function (data) {
                  return data.key === key ? {
                    key: key,
                    result: result
                  } : data;
                });

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _poll.apply(this, arguments);
    }
  }, [cache, debounce, fetch, isStale, keepUnusedDataFor, key, pollingInterval]);
  React.useEffect(function () {
    var now = Date.now();
    cache.forEach(function (_ref2, key) {
      var ttl = _ref2.ttl;

      if (ttl && ttl + keepUnusedDataFor <= now) {
        cache.delete(key);
      }
    });
  }, [cache, keepUnusedDataFor, key]); // Use data.result to force a re-render, but actually retrieve the data from the cache.
  // This gives the _first_ render access to a new result, avoiding lag introduced by React.

  return (_cache$get = cache.get(key)) === null || _cache$get === void 0 ? void 0 : _cache$get.result;
}

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
 */

function useRoutingAPIArguments(_ref) {
  var tokenIn = _ref.tokenIn,
      tokenOut = _ref.tokenOut,
      amount = _ref.amount,
      tradeType = _ref.tradeType,
      useClientSideRouter = _ref.useClientSideRouter;
  return React.useMemo(function () {
    return !tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut) ? undefined : {
      amount: amount.quotient.toString(),
      tokenInAddress: tokenIn.wrapped.address,
      tokenInChainId: tokenIn.wrapped.chainId,
      tokenInDecimals: tokenIn.wrapped.decimals,
      tokenInSymbol: tokenIn.wrapped.symbol,
      tokenOutAddress: tokenOut.wrapped.address,
      tokenOutChainId: tokenOut.wrapped.chainId,
      tokenOutDecimals: tokenOut.wrapped.decimals,
      tokenOutSymbol: tokenOut.wrapped.symbol,
      useClientSideRouter: useClientSideRouter,
      type: tradeType === sdkCore.TradeType.EXACT_INPUT ? 'exactIn' : 'exactOut'
    };
  }, [amount, tokenIn, tokenOut, tradeType, useClientSideRouter]);
}

var _DistributionPercents;
/**
 * Reduces client-side latency by increasing the minimum percentage of the input token to use for each route in a split route while SOR is used client-side.
 * Defaults are defined in https://github.com/Uniswap/smart-order-router/blob/309e6f6603984d3b5aef0733b0cfaf129c29f602/src/routers/alpha-router/config.ts#L83.
 */

var DistributionPercents = (_DistributionPercents = {}, _defineProperty__default["default"](_DistributionPercents, exports.SupportedChainId.MAINNET, 10), _defineProperty__default["default"](_DistributionPercents, exports.SupportedChainId.OPTIMISM, 10), _defineProperty__default["default"](_DistributionPercents, exports.SupportedChainId.OPTIMISTIC_KOVAN, 10), _defineProperty__default["default"](_DistributionPercents, exports.SupportedChainId.ARBITRUM_ONE, 25), _defineProperty__default["default"](_DistributionPercents, exports.SupportedChainId.ARBITRUM_RINKEBY, 25), _DistributionPercents);
var DEFAULT_DISTRIBUTION_PERCENT = 10;

function getConfig(chainId) {
  var _ref;

  return {
    // Limit to only V2 and V3.
    protocols: [routerSdk.Protocol.V2, routerSdk.Protocol.V3],
    distributionPercent: (_ref = chainId && DistributionPercents[chainId]) !== null && _ref !== void 0 ? _ref : DEFAULT_DISTRIBUTION_PERCENT
  };
}

function useClientSideSmartOrderRouterTrade(tradeType, amountSpecified, otherCurrency) {
  var _usePoll, _useStablecoinAmountF;

  var amount = React.useMemo(function () {
    return amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.asFraction;
  }, [amountSpecified]);

  var _ref2 = tradeType === sdkCore.TradeType.EXACT_INPUT ? [amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency, otherCurrency] : [otherCurrency, amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency],
      _ref3 = _slicedToArray__default["default"](_ref2, 2),
      currencyIn = _ref3[0],
      currencyOut = _ref3[1]; // Debounce is used to prevent excessive requests to SOR, as it is data intensive.
  // Fast user actions (ie updating the input) should be debounced, but currency changes should not.


  var _useDebounce = useDebounce(React.useMemo(function () {
    return [amount, currencyIn, currencyOut];
  }, [amount, currencyIn, currencyOut]), 200),
      _useDebounce2 = _slicedToArray__default["default"](_useDebounce, 3),
      debouncedAmount = _useDebounce2[0],
      debouncedCurrencyIn = _useDebounce2[1],
      debouncedCurrencyOut = _useDebounce2[2];

  var isDebouncing = amount !== debouncedAmount && currencyIn === debouncedCurrencyIn && currencyOut === debouncedCurrencyOut;
  var queryArgs = useRoutingAPIArguments({
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: amountSpecified,
    tradeType: tradeType,
    useClientSideRouter: true
  });
  var chainId = amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency.chainId;

  var _useActiveWeb3React = useActiveWeb3React(),
      library = _useActiveWeb3React.library;

  var params = React.useMemo(function () {
    return chainId && library && {
      chainId: chainId,
      provider: library
    };
  }, [chainId, library]);
  var config = React.useMemo(function () {
    return getConfig(chainId);
  }, [chainId]);

  var _useWrapCallback = useWrapCallback(),
      wrapType = _useWrapCallback.type;

  var getQuoteResult = React.useCallback( /*#__PURE__*/_asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
    var _quoteResult;

    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(wrapType !== WrapType.NONE)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", {
              error: undefined
            });

          case 2:
            if (!(!queryArgs || !params)) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", {
              error: undefined
            });

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return Promise.resolve().then(function () { return require('./clientSideSmartOrderRouter-bb6fba83.cjs'); });

          case 7:
            _context.next = 9;
            return _context.sent.getClientSideQuote(queryArgs, params, config);

          case 9:
            _quoteResult = _context.sent;
            return _context.abrupt("return", new Promise(function (resolve) {
              return setImmediate(function () {
                return resolve(_quoteResult);
              });
            }));

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](4);
            return _context.abrupt("return", {
              error: true
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[4, 13]]);
  })), [config, params, queryArgs, wrapType]);
  var getIsValidBlock = useGetIsValidBlock();

  var _ref5 = (_usePoll = usePoll(getQuoteResult, JSON.stringify(queryArgs), {
    debounce: isDebouncing,
    isStale: React.useCallback(function (_ref6) {
      var data = _ref6.data;
      return !getIsValidBlock(Number(data === null || data === void 0 ? void 0 : data.blockNumber) || 0);
    }, [getIsValidBlock])
  })) !== null && _usePoll !== void 0 ? _usePoll : {
    error: undefined
  },
      quoteResult = _ref5.data,
      error = _ref5.error;

  var isValid = getIsValidBlock(Number(quoteResult === null || quoteResult === void 0 ? void 0 : quoteResult.blockNumber) || 0);
  var route = React.useMemo(function () {
    return computeRoutes(currencyIn, currencyOut, tradeType, quoteResult);
  }, [currencyIn, currencyOut, quoteResult, tradeType]);
  var gasUseEstimateUSD = (_useStablecoinAmountF = useStablecoinAmountFromFiatValue(quoteResult === null || quoteResult === void 0 ? void 0 : quoteResult.gasUseEstimateUSD)) !== null && _useStablecoinAmountF !== void 0 ? _useStablecoinAmountF : null;
  var trade = React.useMemo(function () {
    if (route) {
      try {
        return route && transformRoutesToTrade(route, tradeType, gasUseEstimateUSD);
      } catch (e) {
        console.debug('transformRoutesToTrade failed: ', e);
      }
    }

    return;
  }, [gasUseEstimateUSD, route, tradeType]);
  return React.useMemo(function () {
    if (!currencyIn || !currencyOut) {
      return {
        state: TradeState.INVALID,
        trade: undefined
      };
    }

    if (!trade && !error) {
      if (isDebouncing) {
        return {
          state: TradeState.SYNCING,
          trade: undefined
        };
      } else if (!isValid) {
        return {
          state: TradeState.LOADING,
          trade: undefined
        };
      }
    }

    var otherAmount = undefined;

    if (quoteResult) {
      switch (tradeType) {
        case sdkCore.TradeType.EXACT_INPUT:
          otherAmount = sdkCore.CurrencyAmount.fromRawAmount(currencyOut, quoteResult.quote);
          break;

        case sdkCore.TradeType.EXACT_OUTPUT:
          otherAmount = sdkCore.CurrencyAmount.fromRawAmount(currencyIn, quoteResult.quote);
          break;
      }
    }

    if (error || !otherAmount || !route || route.length === 0) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined
      };
    }

    if (trade) {
      return {
        state: TradeState.VALID,
        trade: trade
      };
    }

    return {
      state: TradeState.INVALID,
      trade: undefined
    };
  }, [currencyIn, currencyOut, trade, error, isValid, quoteResult, route, isDebouncing, tradeType]);
}

var INVALID_TRADE = {
  state: TradeState.INVALID,
  trade: undefined
};
/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */

function useBestTrade(tradeType, amountSpecified, otherCurrency) {
  var _useLast;

  var clientSORTradeObject = useClientSideSmartOrderRouterTrade(tradeType, amountSpecified, otherCurrency); // Use a simple client side logic as backup if SOR is not available.

  var useFallback = clientSORTradeObject.state === TradeState.NO_ROUTE_FOUND || clientSORTradeObject.state === TradeState.INVALID;
  var fallbackTradeObject = useClientSideV3Trade(tradeType, useFallback ? amountSpecified : undefined, useFallback ? otherCurrency : undefined);
  var tradeObject = useFallback ? fallbackTradeObject : clientSORTradeObject;
  var lastTrade = (_useLast = useLast(tradeObject.trade, Boolean)) !== null && _useLast !== void 0 ? _useLast : undefined; // Return the last trade while syncing/loading to avoid jank from clearing the last trade while loading.
  // If the trade is unsettled and not stale, return the last trade as a placeholder during settling.

  return React.useMemo(function () {
    var _lastTrade$inputAmoun, _lastTrade$outputAmou;

    var state = tradeObject.state,
        trade = tradeObject.trade; // If the trade is in a settled state, return it.

    if (state === TradeState.INVALID) return INVALID_TRADE;
    if (state !== TradeState.LOADING && state !== TradeState.SYNCING || trade) return tradeObject;

    var _ref = tradeType === sdkCore.TradeType.EXACT_INPUT ? [amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency, otherCurrency] : [otherCurrency, amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency],
        _ref2 = _slicedToArray__default["default"](_ref, 2),
        currencyIn = _ref2[0],
        currencyOut = _ref2[1]; // If the trade currencies have switched, consider it stale - do not return the last trade.


    var isStale = currencyIn && !(lastTrade !== null && lastTrade !== void 0 && (_lastTrade$inputAmoun = lastTrade.inputAmount) !== null && _lastTrade$inputAmoun !== void 0 && _lastTrade$inputAmoun.currency.equals(currencyIn)) || currencyOut && !(lastTrade !== null && lastTrade !== void 0 && (_lastTrade$outputAmou = lastTrade.outputAmount) !== null && _lastTrade$outputAmou !== void 0 && _lastTrade$outputAmou.currency.equals(currencyOut));
    if (isStale) return tradeObject;
    return {
      state: state,
      trade: lastTrade
    };
  }, [amountSpecified === null || amountSpecified === void 0 ? void 0 : amountSpecified.currency, lastTrade, otherCurrency, tradeObject, tradeType]);
}

var _DEFAULT_SWAP_INFO;

// from the current swap inputs, compute the best trade and return it.
function useComputeSwapInfo() {
  var _trade$trade2, _trade$trade4, _trade$trade5, _trade$trade6;

  var _useWrapCallback = useWrapCallback(),
      wrapType = _useWrapCallback.type;

  var isWrapping = wrapType === WrapType.WRAP || wrapType === WrapType.UNWRAP;

  var _useAtomValue = utils.useAtomValue(swapAtom),
      independentField = _useAtomValue.independentField,
      amount = _useAtomValue.amount,
      currencyIn = _useAtomValue[Field.INPUT],
      currencyOut = _useAtomValue[Field.OUTPUT];

  var isExactIn = independentField === Field.INPUT;
  var parsedAmount = React.useMemo(function () {
    var _ref;

    return tryParseCurrencyAmount(amount, (_ref = isExactIn ? currencyIn : currencyOut) !== null && _ref !== void 0 ? _ref : undefined);
  }, [amount, isExactIn, currencyIn, currencyOut]);
  var hasAmounts = currencyIn && currencyOut && parsedAmount && !isWrapping;
  var trade = useBestTrade(isExactIn ? sdkCore.TradeType.EXACT_INPUT : sdkCore.TradeType.EXACT_OUTPUT, hasAmounts ? parsedAmount : undefined, hasAmounts ? isExactIn ? currencyOut : currencyIn : undefined);
  var amountIn = React.useMemo(function () {
    var _trade$trade;

    return isWrapping || isExactIn ? parsedAmount : (_trade$trade = trade.trade) === null || _trade$trade === void 0 ? void 0 : _trade$trade.inputAmount;
  }, [isExactIn, isWrapping, parsedAmount, (_trade$trade2 = trade.trade) === null || _trade$trade2 === void 0 ? void 0 : _trade$trade2.inputAmount]);
  var amountOut = React.useMemo(function () {
    var _trade$trade3;

    return isWrapping || !isExactIn ? parsedAmount : (_trade$trade3 = trade.trade) === null || _trade$trade3 === void 0 ? void 0 : _trade$trade3.outputAmount;
  }, [isExactIn, isWrapping, parsedAmount, (_trade$trade4 = trade.trade) === null || _trade$trade4 === void 0 ? void 0 : _trade$trade4.outputAmount]);

  var _useActiveWeb3React = useActiveWeb3React(),
      account = _useActiveWeb3React.account;

  var _useCurrencyBalances = useCurrencyBalances(account, React.useMemo(function () {
    return [currencyIn, currencyOut];
  }, [currencyIn, currencyOut])),
      _useCurrencyBalances2 = _slicedToArray__default["default"](_useCurrencyBalances, 2),
      balanceIn = _useCurrencyBalances2[0],
      balanceOut = _useCurrencyBalances2[1]; // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // (Using amountIn/amountOut would show (incorrect) intermediate values.)


  var slippage = useSlippage(trade.trade);

  var _useUSDCPriceImpact = useUSDCPriceImpact((_trade$trade5 = trade.trade) === null || _trade$trade5 === void 0 ? void 0 : _trade$trade5.inputAmount, (_trade$trade6 = trade.trade) === null || _trade$trade6 === void 0 ? void 0 : _trade$trade6.outputAmount),
      inputUSDC = _useUSDCPriceImpact.inputUSDC,
      outputUSDC = _useUSDCPriceImpact.outputUSDC,
      impact = _useUSDCPriceImpact.impact;

  return React.useMemo(function () {
    var _ref2;

    return _ref2 = {}, _defineProperty__default["default"](_ref2, Field.INPUT, {
      currency: currencyIn,
      amount: amountIn,
      balance: balanceIn,
      usdc: inputUSDC
    }), _defineProperty__default["default"](_ref2, Field.OUTPUT, {
      currency: currencyOut,
      amount: amountOut,
      balance: balanceOut,
      usdc: outputUSDC
    }), _defineProperty__default["default"](_ref2, "trade", trade), _defineProperty__default["default"](_ref2, "slippage", slippage), _defineProperty__default["default"](_ref2, "impact", impact), _ref2;
  }, [amountIn, amountOut, balanceIn, balanceOut, currencyIn, currencyOut, impact, inputUSDC, outputUSDC, slippage, trade]);
}

var DEFAULT_SWAP_INFO = (_DEFAULT_SWAP_INFO = {}, _defineProperty__default["default"](_DEFAULT_SWAP_INFO, Field.INPUT, {}), _defineProperty__default["default"](_DEFAULT_SWAP_INFO, Field.OUTPUT, {}), _defineProperty__default["default"](_DEFAULT_SWAP_INFO, "trade", INVALID_TRADE), _defineProperty__default["default"](_DEFAULT_SWAP_INFO, "slippage", DEFAULT_SLIPPAGE), _DEFAULT_SWAP_INFO);
var SwapInfoContext = /*#__PURE__*/React.createContext(DEFAULT_SWAP_INFO);
function SwapInfoProvider(_ref3) {
  var children = _ref3.children,
      disabled = _ref3.disabled;
  var swapInfo = useComputeSwapInfo();

  if (disabled) {
    return /*#__PURE__*/React__default["default"].createElement(SwapInfoContext.Provider, {
      value: DEFAULT_SWAP_INFO
    }, children);
  }

  return /*#__PURE__*/React__default["default"].createElement(SwapInfoContext.Provider, {
    value: swapInfo
  }, children);
}
/** Requires that SwapInfoUpdater be installed in the DOM tree. **/

function useSwapInfo() {
  return React.useContext(SwapInfoContext);
}

function useSyncConvenienceFee(_ref) {
  var convenienceFee = _ref.convenienceFee,
      convenienceFeeRecipient = _ref.convenienceFeeRecipient;

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var updateFeeOptions = utils.useUpdateAtom(feeOptionsAtom);
  React.useEffect(function () {
    if (convenienceFee && convenienceFeeRecipient) {
      if (typeof convenienceFeeRecipient === 'string') {
        updateFeeOptions({
          fee: new sdkCore.Percent(convenienceFee, 10000),
          recipient: convenienceFeeRecipient
        });
        return;
      }

      if (chainId && convenienceFeeRecipient[chainId]) {
        updateFeeOptions({
          fee: new sdkCore.Percent(convenienceFee, 10000),
          recipient: convenienceFeeRecipient[chainId]
        });
        return;
      }
    }

    updateFeeOptions(undefined);
  }, [chainId, convenienceFee, convenienceFeeRecipient, updateFeeOptions]);
}

var REGISTRAR_ABI = [{
  constant: true,
  inputs: [{
    name: 'node',
    type: 'bytes32'
  }],
  name: 'resolver',
  outputs: [{
    name: 'resolverAddress',
    type: 'address'
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function'
}];
var REGISTRAR_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
var RESOLVER_ABI = [{
  constant: true,
  inputs: [{
    internalType: 'bytes32',
    name: 'node',
    type: 'bytes32'
  }],
  name: 'contenthash',
  outputs: [{
    internalType: 'bytes',
    name: '',
    type: 'bytes'
  }],
  payable: false,
  stateMutability: 'view',
  type: 'function'
}]; // cache the resolver contracts since most of them are the public resolver

function resolverContract(resolverAddress, provider) {
  return new contracts.Contract(resolverAddress, RESOLVER_ABI, provider);
}
/**
 * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
 * @param ensName to resolve
 * @param provider provider to use to fetch the data
 */


function resolveENSContentHash(_x, _x2) {
  return _resolveENSContentHash.apply(this, arguments);
}

function _resolveENSContentHash() {
  _resolveENSContentHash = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(ensName, provider) {
    var ensRegistrarContract, hash$1, resolverAddress;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ensRegistrarContract = new contracts.Contract(REGISTRAR_ADDRESS, REGISTRAR_ABI, provider);
            hash$1 = hash.namehash(ensName);
            _context.next = 4;
            return ensRegistrarContract.resolver(hash$1);

          case 4:
            resolverAddress = _context.sent;
            return _context.abrupt("return", resolverContract(resolverAddress, provider).contenthash(hash$1));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _resolveENSContentHash.apply(this, arguments);
}

function hexToUint8Array(hex) {
  hex = hex.startsWith('0x') ? hex.substr(2) : hex;
  if (hex.length % 2 !== 0) throw new Error('hex must have length that is multiple of 2');
  var arr = new Uint8Array(hex.length / 2);

  for (var i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }

  return arr;
}
var UTF_8_DECODER = new TextDecoder('utf-8');
/**
 * Returns the URI representation of the content hash for supported codecs
 * @param contenthash to decode
 */

function contenthashToUri(contenthash) {
  var data = hexToUint8Array(contenthash);
  var codec = multicodec.getNameFromData(data);

  switch (codec) {
    case 'ipfs-ns':
      {
        var unprefixedData = multicodec.rmPrefix(data);
        var cid = new CID__default["default"](unprefixedData);
        return "ipfs://".concat(multihashes.toB58String(cid.multihash));
      }

    case 'ipns-ns':
      {
        var _unprefixedData = multicodec.rmPrefix(data);

        var _cid = new CID__default["default"](_unprefixedData);

        var multihash = multihashes.decode(_cid.multihash);

        if (multihash.name === 'identity') {
          return "ipns://".concat(UTF_8_DECODER.decode(multihash.digest).trim());
        } else {
          return "ipns://".concat(multihashes.toB58String(_cid.multihash));
        }
      }

    default:
      throw new Error("Unrecognized codec: ".concat(codec));
  }
}

var ENS_NAME_REGEX = /^(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+)eth(\/.*)?$/;
function parseENSAddress(ensAddress) {
  var match = ensAddress.match(ENS_NAME_REGEX);
  if (!match) return undefined;
  return {
    ensName: "".concat(match[1].toLowerCase(), "eth"),
    ensPath: match[4]
  };
}

/**
 * Given a URI that may be ipfs, ipns, http, https, ar, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
function uriToHttp(uri) {
  var _uri$match, _uri$match2, _uri$match3;

  var protocol = uri.split(':')[0].toLowerCase();

  switch (protocol) {
    case 'data':
      return [uri];

    case 'https':
      return [uri];

    case 'http':
      return ['https' + uri.substr(4), uri];

    case 'ipfs':
      var hash = (_uri$match = uri.match(/^ipfs:(\/\/)?(.*)$/i)) === null || _uri$match === void 0 ? void 0 : _uri$match[2];
      return ["https://cloudflare-ipfs.com/ipfs/".concat(hash, "/"), "https://ipfs.io/ipfs/".concat(hash, "/")];

    case 'ipns':
      var name = (_uri$match2 = uri.match(/^ipns:(\/\/)?(.*)$/i)) === null || _uri$match2 === void 0 ? void 0 : _uri$match2[2];
      return ["https://cloudflare-ipfs.com/ipns/".concat(name, "/"), "https://ipfs.io/ipns/".concat(name, "/")];

    case 'ar':
      var tx = (_uri$match3 = uri.match(/^ar:(\/\/)?(.*)$/i)) === null || _uri$match3 === void 0 ? void 0 : _uri$match3[2];
      return ["https://arweave.net/".concat(tx)];

    default:
      return [];
  }
}

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$5(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var ValidationSchema;

(function (ValidationSchema) {
  ValidationSchema["LIST"] = "list";
  ValidationSchema["TOKENS"] = "tokens";
})(ValidationSchema || (ValidationSchema = {}));

var validator = new Promise( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(resolve) {
    var _yield$Promise$all, _yield$Promise$all2, ajv, schema, validator;

    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Promise.all([Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('ajv')); }), Promise.resolve().then(function () { return require('./tokenlist.schema-1a1c4e93.cjs'); })]);

          case 2:
            _yield$Promise$all = _context.sent;
            _yield$Promise$all2 = _slicedToArray__default["default"](_yield$Promise$all, 2);
            ajv = _yield$Promise$all2[0];
            schema = _yield$Promise$all2[1];
            validator = new ajv.default({
              allErrors: true
            }).addSchema(schema, ValidationSchema.LIST) // Adds a meta scheme of Pick<TokenList, 'tokens'>
            .addSchema(_objectSpread$5(_objectSpread$5({}, schema), {}, {
              $id: schema.$id + '#tokens',
              required: ['tokens']
            }), ValidationSchema.TOKENS);
            resolve(validator);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

function getValidationErrors(validate) {
  var _validate$errors$map$, _validate$errors;

  return (_validate$errors$map$ = validate === null || validate === void 0 ? void 0 : (_validate$errors = validate.errors) === null || _validate$errors === void 0 ? void 0 : _validate$errors.map(function (error) {
    return [error.dataPath, error.message].filter(Boolean).join(' ');
  }).join('; ')) !== null && _validate$errors$map$ !== void 0 ? _validate$errors$map$ : 'unknown error';
}
/**
 * Validates an array of tokens.
 * @param json the TokenInfo[] to validate
 */


function validateTokens(_x2) {
  return _validateTokens.apply(this, arguments);
}
/**
 * Validates a token list.
 * @param json the TokenList to validate
 */

function _validateTokens() {
  _validateTokens = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(json) {
    var validate;
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return validator;

          case 2:
            validate = _context2.sent.getSchema(ValidationSchema.TOKENS);

            if (!(validate !== null && validate !== void 0 && validate({
              tokens: json
            }))) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", json);

          case 5:
            throw new Error("Token list failed validation: ".concat(getValidationErrors(validate)));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _validateTokens.apply(this, arguments);
}

function validateTokenList(_x3) {
  return _validateTokenList.apply(this, arguments);
}

function _validateTokenList() {
  _validateTokenList = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(json) {
    var validate;
    return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return validator;

          case 2:
            validate = _context3.sent.getSchema(ValidationSchema.LIST);

            if (!(validate !== null && validate !== void 0 && validate(json))) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", json);

          case 5:
            throw new Error("Token list failed validation: ".concat(getValidationErrors(validate)));

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _validateTokenList.apply(this, arguments);
}

var listCache = new Map();
/** Fetches and validates a token list. */

function fetchTokenList(_x, _x2) {
  return _fetchTokenList.apply(this, arguments);
}

function _fetchTokenList() {
  _fetchTokenList = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(listUrl, resolveENSContentHash) {
    var cached, urls, parsedENS, _parsedENS$ensPath, contentHashUri, message, translatedUri, _message, i, url, isLast, response, _message2, _message3, json, list;

    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cached = listCache === null || listCache === void 0 ? void 0 : listCache.get(listUrl); // avoid spurious re-fetches

            if (!cached) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", cached);

          case 3:
            parsedENS = parseENSAddress(listUrl);

            if (!parsedENS) {
              _context.next = 28;
              break;
            }

            _context.prev = 5;
            _context.next = 8;
            return resolveENSContentHash(parsedENS.ensName);

          case 8:
            contentHashUri = _context.sent;
            _context.next = 16;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](5);
            message = "failed to resolve ENS name: ".concat(parsedENS.ensName);
            console.debug(message, _context.t0);
            throw new Error(message);

          case 16:
            _context.prev = 16;
            translatedUri = contenthashToUri(contentHashUri);
            _context.next = 25;
            break;

          case 20:
            _context.prev = 20;
            _context.t1 = _context["catch"](16);
            _message = "failed to translate contenthash to URI: ".concat(contentHashUri);
            console.debug(_message, _context.t1);
            throw new Error(_message);

          case 25:
            urls = uriToHttp("".concat(translatedUri).concat((_parsedENS$ensPath = parsedENS.ensPath) !== null && _parsedENS$ensPath !== void 0 ? _parsedENS$ensPath : ''));
            _context.next = 29;
            break;

          case 28:
            urls = uriToHttp(listUrl);

          case 29:
            i = 0;

          case 30:
            if (!(i < urls.length)) {
              _context.next = 64;
              break;
            }

            url = urls[i];
            isLast = i === urls.length - 1;
            response = void 0;
            _context.prev = 34;
            _context.next = 37;
            return fetch(url, {
              credentials: 'omit'
            });

          case 37:
            response = _context.sent;
            _context.next = 47;
            break;

          case 40:
            _context.prev = 40;
            _context.t2 = _context["catch"](34);
            _message2 = "failed to fetch list: ".concat(listUrl);
            console.debug(_message2, _context.t2);

            if (!isLast) {
              _context.next = 46;
              break;
            }

            throw new Error(_message2);

          case 46:
            return _context.abrupt("continue", 61);

          case 47:
            if (response.ok) {
              _context.next = 53;
              break;
            }

            _message3 = "failed to fetch list: ".concat(listUrl);
            console.debug(_message3, response.statusText);

            if (!isLast) {
              _context.next = 52;
              break;
            }

            throw new Error(_message3);

          case 52:
            return _context.abrupt("continue", 61);

          case 53:
            _context.next = 55;
            return response.json();

          case 55:
            json = _context.sent;
            _context.next = 58;
            return validateTokenList(json);

          case 58:
            list = _context.sent;
            listCache === null || listCache === void 0 ? void 0 : listCache.set(listUrl, list);
            return _context.abrupt("return", list);

          case 61:
            i++;
            _context.next = 30;
            break;

          case 64:
            throw new Error('Unrecognized list URL protocol.');

          case 65:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[5, 11], [16, 20], [34, 40]]);
  }));
  return _fetchTokenList.apply(this, arguments);
}

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$4(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Token instances created from token info on a token list.
 */
var WrappedTokenInfo = /*#__PURE__*/function () {
  function WrappedTokenInfo(tokenInfo, list) {
    _classCallCheck__default["default"](this, WrappedTokenInfo);

    _defineProperty__default["default"](this, "isNative", false);

    _defineProperty__default["default"](this, "isToken", true);

    _defineProperty__default["default"](this, "_checksummedAddress", null);

    _defineProperty__default["default"](this, "_tags", null);

    this.tokenInfo = tokenInfo;
    this.list = list;
  }

  _createClass__default["default"](WrappedTokenInfo, [{
    key: "address",
    get: function get() {
      if (this._checksummedAddress) return this._checksummedAddress;
      var checksummedAddress = isAddress(this.tokenInfo.address);
      if (!checksummedAddress) throw new Error("Invalid token address: ".concat(this.tokenInfo.address));
      return this._checksummedAddress = checksummedAddress;
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.tokenInfo.chainId;
    }
  }, {
    key: "decimals",
    get: function get() {
      return this.tokenInfo.decimals;
    }
  }, {
    key: "name",
    get: function get() {
      return this.tokenInfo.name;
    }
  }, {
    key: "symbol",
    get: function get() {
      return this.tokenInfo.symbol;
    }
  }, {
    key: "logoURI",
    get: function get() {
      return this.tokenInfo.logoURI;
    }
  }, {
    key: "tags",
    get: function get() {
      var _this$list;

      if (this._tags !== null) return this._tags;
      if (!this.tokenInfo.tags) return this._tags = [];
      var listTags = (_this$list = this.list) === null || _this$list === void 0 ? void 0 : _this$list.tags;
      if (!listTags) return this._tags = [];
      return this._tags = this.tokenInfo.tags.map(function (tagId) {
        return _objectSpread$4(_objectSpread$4({}, listTags[tagId]), {}, {
          id: tagId
        });
      });
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return other.chainId === this.chainId && other.isToken && other.address.toLowerCase() === this.address.toLowerCase();
    }
  }, {
    key: "sortsBefore",
    value: function sortsBefore(other) {
      if (this.equals(other)) throw new Error('Addresses should not be equal');
      return this.address.toLowerCase() < other.address.toLowerCase();
    }
  }, {
    key: "wrapped",
    get: function get() {
      return this;
    }
  }]);

  return WrappedTokenInfo;
}();

var mapCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
function tokensToChainTokenMap(tokens) {
  var cached = mapCache === null || mapCache === void 0 ? void 0 : mapCache.get(tokens);
  if (cached) return cached;

  var _ref = Array.isArray(tokens) ? [undefined, tokens] : [tokens, tokens.tokens],
      _ref2 = _slicedToArray__default["default"](_ref, 2),
      list = _ref2[0],
      infos = _ref2[1];

  var map = infos.reduce(function (map, info) {
    var _map$token$chainId;

    var token = new WrappedTokenInfo(info, list);

    if (((_map$token$chainId = map[token.chainId]) === null || _map$token$chainId === void 0 ? void 0 : _map$token$chainId[token.address]) !== undefined) {
      console.warn("Duplicate token skipped: ".concat(token.address));
      return map;
    }

    if (!map[token.chainId]) {
      map[token.chainId] = {};
    }

    map[token.chainId][token.address] = {
      token: token,
      list: list
    };
    return map;
  }, {});
  mapCache === null || mapCache === void 0 ? void 0 : mapCache.set(tokens, map);
  return map;
}

var DEFAULT_TOKEN_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org';
var MISSING_PROVIDER = Symbol();
var ChainTokenMapContext = /*#__PURE__*/React.createContext(MISSING_PROVIDER);

function useChainTokenMapContext() {
  var chainTokenMap = React.useContext(ChainTokenMapContext);

  if (chainTokenMap === MISSING_PROVIDER) {
    throw new Error('TokenList hooks must be wrapped in a <TokenListProvider>');
  }

  return chainTokenMap;
}

function useIsTokenListLoaded() {
  return Boolean(useChainTokenMapContext());
}
function useTokenMap() {
  var _useActiveWeb3React2 = useActiveWeb3React(),
      chainId = _useActiveWeb3React2.chainId;

  var chainTokenMap = useChainTokenMapContext();
  var tokenMap = chainId && (chainTokenMap === null || chainTokenMap === void 0 ? void 0 : chainTokenMap[chainId]);
  return React.useMemo(function () {
    if (!tokenMap) return {};
    return Object.entries(tokenMap).reduce(function (map, _ref2) {
      var _ref3 = _slicedToArray__default["default"](_ref2, 2),
          address = _ref3[0],
          token = _ref3[1].token;

      map[address] = token;
      return map;
    }, {});
  }, [tokenMap]);
}
function TokenListProvider(_ref4) {
  var _ref4$list = _ref4.list,
      list = _ref4$list === void 0 ? DEFAULT_TOKEN_LIST : _ref4$list,
      children = _ref4.children;

  // Error boundaries will not catch (non-rendering) async errors, but it should still be shown
  var _useState = React.useState(),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      error = _useState2[0],
      setError = _useState2[1];

  if (error) throw error;

  var _useState3 = React.useState(),
      _useState4 = _slicedToArray__default["default"](_useState3, 2),
      chainTokenMap = _useState4[0],
      setChainTokenMap = _useState4[1];

  React.useEffect(function () {
    return setChainTokenMap(undefined);
  }, [list]);

  var _useActiveWeb3React3 = useActiveWeb3React(),
      chainId = _useActiveWeb3React3.chainId,
      library = _useActiveWeb3React3.library;

  var resolver = React.useCallback(function (ensName) {
    if (library && chainId === 1) {
      return resolveENSContentHash(ensName, library);
    }

    throw new Error('Could not construct mainnet ENS resolver');
  }, [chainId, library]);
  React.useEffect(function () {
    // If the list was already loaded, don't reload it.
    if (chainTokenMap) return;
    var stale = false;
    activateList(list);
    return function () {
      stale = true;
    };

    function activateList(_x) {
      return _activateList.apply(this, arguments);
    }

    function _activateList() {
      _activateList = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(list) {
        var tokens, map;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(typeof list === 'string')) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return fetchTokenList(list, resolver);

              case 4:
                tokens = _context.sent;
                _context.next = 10;
                break;

              case 7:
                _context.next = 9;
                return validateTokens(list);

              case 9:
                tokens = _context.sent;

              case 10:
                // tokensToChainTokenMap also caches the fetched tokens, so it must be invoked even if stale.
                map = tokensToChainTokenMap(tokens);

                if (!stale) {
                  setChainTokenMap(map);
                  setError(undefined);
                }

                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);

                if (!stale) {
                  // Do not update the token map, in case the map was already resolved without error on mainnet.
                  setError(_context.t0);
                }

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 14]]);
      }));
      return _activateList.apply(this, arguments);
    }
  }, [chainTokenMap, list, resolver]);
  return /*#__PURE__*/React__default["default"].createElement(ChainTokenMapContext.Provider, {
    value: chainTokenMap
  }, children);
}

var BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(str, bytes32, defaultValue) {
  return str && str.length > 0 ? str : // need to check for proper bytes string and valid terminator
  bytes32 && BYTES32_REGEX.test(bytes32) && bytes.arrayify(bytes32)[31] === 0 ? strings.parseBytes32String(bytes32) : defaultValue;
}
/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */


function useTokenFromNetwork(tokenAddress) {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var formattedAddress = isAddress(tokenAddress);
  var tokenContract = useTokenContract(formattedAddress ? formattedAddress : undefined, false);
  var tokenContractBytes32 = useBytes32TokenContract(formattedAddress ? formattedAddress : undefined, false);
  var tokenName = useSingleCallResult(tokenContract, 'name', undefined, reduxMulticall.NEVER_RELOAD);
  var tokenNameBytes32 = useSingleCallResult(tokenContractBytes32, 'name', undefined, reduxMulticall.NEVER_RELOAD);
  var symbol = useSingleCallResult(tokenContract, 'symbol', undefined, reduxMulticall.NEVER_RELOAD);
  var symbolBytes32 = useSingleCallResult(tokenContractBytes32, 'symbol', undefined, reduxMulticall.NEVER_RELOAD);
  var decimals = useSingleCallResult(tokenContract, 'decimals', undefined, reduxMulticall.NEVER_RELOAD);
  return React.useMemo(function () {
    if (typeof tokenAddress !== 'string' || !chainId || !formattedAddress) return undefined;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;

    if (decimals.result) {
      var _symbol$result, _symbolBytes32$result, _tokenName$result, _tokenNameBytes32$res;

      return new sdkCore.Token(chainId, formattedAddress, decimals.result[0], parseStringOrBytes32((_symbol$result = symbol.result) === null || _symbol$result === void 0 ? void 0 : _symbol$result[0], (_symbolBytes32$result = symbolBytes32.result) === null || _symbolBytes32$result === void 0 ? void 0 : _symbolBytes32$result[0], 'UNKNOWN'), parseStringOrBytes32((_tokenName$result = tokenName.result) === null || _tokenName$result === void 0 ? void 0 : _tokenName$result[0], (_tokenNameBytes32$res = tokenNameBytes32.result) === null || _tokenNameBytes32$res === void 0 ? void 0 : _tokenNameBytes32$res[0], 'Unknown Token'));
    }

    return undefined;
  }, [formattedAddress, chainId, decimals.loading, decimals.result, symbol.loading, symbol.result, symbolBytes32.result, tokenAddress, tokenName.loading, tokenName.result, tokenNameBytes32.result]);
}
/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */

function useTokenFromMapOrNetwork(tokens, tokenAddress) {
  var address = isAddress(tokenAddress);
  var token = address ? tokens[address] : undefined;
  var tokenFromNetwork = useTokenFromNetwork(token ? undefined : address ? address : undefined);
  return tokenFromNetwork !== null && tokenFromNetwork !== void 0 ? tokenFromNetwork : token;
}
/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */

function useToken(tokenAddress) {
  var tokens = useTokenMap();
  return useTokenFromMapOrNetwork(tokens, tokenAddress);
}

function useOnSupportedNetwork() {
  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  return React.useMemo(function () {
    return Boolean(chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId));
  }, [chainId]);
}

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$3(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function useDefaultToken(defaultAddress, chainId) {
  var address = undefined;

  if (typeof defaultAddress === 'string') {
    address = defaultAddress;
  } else if (_typeof__default["default"](defaultAddress) === 'object' && chainId) {
    address = defaultAddress[chainId];
  }

  var token = useToken(address);
  var onSupportedNetwork = useOnSupportedNetwork(); // Only use native currency if chain ID is in supported chains. ExtendedEther will error otherwise.

  if (chainId && address === 'NATIVE' && onSupportedNetwork) {
    return nativeOnChain(chainId);
  }

  return token !== null && token !== void 0 ? token : undefined;
}

function useSyncTokenDefaults(_ref) {
  var _useDefaultToken;

  var defaultInputTokenAddress = _ref.defaultInputTokenAddress,
      defaultInputAmount = _ref.defaultInputAmount,
      defaultOutputTokenAddress = _ref.defaultOutputTokenAddress,
      defaultOutputAmount = _ref.defaultOutputAmount;
  var updateSwap = utils.useUpdateAtom(swapAtom);

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var onSupportedNetwork = useOnSupportedNetwork();
  var nativeCurrency = useNativeCurrency();
  var defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId);
  var defaultInputToken = (_useDefaultToken = useDefaultToken(defaultInputTokenAddress, chainId)) !== null && _useDefaultToken !== void 0 ? _useDefaultToken : // Default the input token to the native currency if it is not the output token.
  defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined;
  var setToDefaults = React.useCallback(function () {
    var _defaultSwapState;

    var defaultSwapState = (_defaultSwapState = {
      amount: ''
    }, _defineProperty__default["default"](_defaultSwapState, Field.INPUT, defaultInputToken), _defineProperty__default["default"](_defaultSwapState, Field.OUTPUT, defaultOutputToken), _defineProperty__default["default"](_defaultSwapState, "independentField", Field.INPUT), _defaultSwapState);

    if (defaultInputToken && defaultInputAmount) {
      defaultSwapState.amount = defaultInputAmount.toString();
    } else if (defaultOutputToken && defaultOutputAmount) {
      defaultSwapState.independentField = Field.OUTPUT;
      defaultSwapState.amount = defaultOutputAmount.toString();
    }

    updateSwap(function (swap) {
      return _objectSpread$3(_objectSpread$3({}, swap), defaultSwapState);
    });
  }, [defaultInputAmount, defaultInputToken, defaultOutputAmount, defaultOutputToken, updateSwap]);
  var lastChainId = React.useRef(undefined);
  var isTokenListLoaded = useIsTokenListLoaded();
  React.useEffect(function () {
    var shouldSync = isTokenListLoaded && chainId && chainId !== lastChainId.current;

    if (shouldSync) {
      setToDefaults();
      lastChainId.current = chainId;
    }
  }, [isTokenListLoaded, chainId, setToDefaults]);
}

function otherField(field) {
  switch (field) {
    case Field.INPUT:
      return Field.OUTPUT;

    case Field.OUTPUT:
      return Field.INPUT;
  }
}

function useSwitchSwapCurrencies() {
  var update = utils.useUpdateAtom(swapAtom);
  return React.useCallback(function () {
    update(function (swap) {
      var oldOutput = swap[Field.OUTPUT];
      swap[Field.OUTPUT] = swap[Field.INPUT];
      swap[Field.INPUT] = oldOutput;

      switch (swap.independentField) {
        case Field.INPUT:
          swap.independentField = Field.OUTPUT;
          break;

        case Field.OUTPUT:
          swap.independentField = Field.INPUT;
          break;
      }
    });
  }, [update]);
}
function useSwapCurrency(field) {
  var atom = React.useMemo(function () {
    return pickAtom(swapAtom, field);
  }, [field]);
  var otherAtom = React.useMemo(function () {
    return pickAtom(swapAtom, otherField(field));
  }, [field]);

  var _useAtom = jotai.useAtom(atom),
      _useAtom2 = _slicedToArray__default["default"](_useAtom, 2),
      currency = _useAtom2[0],
      setCurrency = _useAtom2[1];

  var otherCurrency = utils.useAtomValue(otherAtom);
  var switchSwapCurrencies = useSwitchSwapCurrencies();
  var setOrSwitchCurrency = React.useCallback(function (currency) {
    if (currency === otherCurrency) {
      switchSwapCurrencies();
    } else {
      setCurrency(currency);
    }
  }, [otherCurrency, setCurrency, switchSwapCurrencies]);
  return [currency, setOrSwitchCurrency];
}
var independentFieldAtom = pickAtom(swapAtom, 'independentField');
function useIsSwapFieldIndependent(field) {
  var independentField = utils.useAtomValue(independentFieldAtom);
  return independentField === field;
}
var amountAtom = pickAtom(swapAtom, 'amount'); // check if any amount has been entered by user

function useIsAmountPopulated() {
  return Boolean(utils.useAtomValue(amountAtom));
}
function useSwapAmount(field) {
  var amount = utils.useAtomValue(amountAtom);
  var isFieldIndependent = useIsSwapFieldIndependent(field);
  var value = isFieldIndependent ? amount : undefined;
  var updateSwap = utils.useUpdateAtom(swapAtom);
  var updateAmount = React.useCallback(function (amount) {
    return updateSwap(function (swap) {
      swap.independentField = field;
      swap.amount = amount;
    });
  }, [field, updateSwap]);
  return [value, updateAmount];
}
function useSwapCurrencyAmount(field) {
  var isFieldIndependent = useIsSwapFieldIndependent(field);
  var isAmountPopulated = useIsAmountPopulated();

  var _useSwapAmount = useSwapAmount(field),
      _useSwapAmount2 = _slicedToArray__default["default"](_useSwapAmount, 1),
      swapAmount = _useSwapAmount2[0];

  var _useSwapCurrency = useSwapCurrency(field),
      _useSwapCurrency2 = _slicedToArray__default["default"](_useSwapCurrency, 1),
      swapCurrency = _useSwapCurrency2[0];

  var currencyAmount = React.useMemo(function () {
    return tryParseCurrencyAmount(swapAmount, swapCurrency);
  }, [swapAmount, swapCurrency]);

  if (isFieldIndependent && isAmountPopulated) {
    return currencyAmount;
  }

  return;
}

var MIN_NATIVE_CURRENCY_FOR_GAS = JSBI__default["default"].exponentiate(JSBI__default["default"].BigInt(10), JSBI__default["default"].BigInt(16)); // .01 ETH

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */

function maxAmountSpend(currencyAmount) {
  if (!currencyAmount) return undefined;

  if (currencyAmount.currency.isNative) {
    if (JSBI__default["default"].greaterThan(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS)) {
      return sdkCore.CurrencyAmount.fromRawAmount(currencyAmount.currency, JSBI__default["default"].subtract(currencyAmount.quotient, MIN_NATIVE_CURRENCY_FOR_GAS));
    } else {
      return sdkCore.CurrencyAmount.fromRawAmount(currencyAmount.currency, JSBI__default["default"].BigInt(0));
    }
  }

  return currencyAmount;
}

function useFormattedFieldAmount(_ref) {
  var disabled = _ref.disabled,
      currencyAmount = _ref.currencyAmount,
      fieldAmount = _ref.fieldAmount;
  return React.useMemo(function () {
    if (disabled) {
      return '';
    }

    if (fieldAmount !== undefined) {
      return fieldAmount;
    }

    if (currencyAmount) {
      return currencyAmount.toSignificant(6);
    }

    return '';
  }, [disabled, currencyAmount, fieldAmount]);
}
function useInput(_ref2) {
  var input = _ref2.input,
      output = _ref2.output;
  var swapInfo = useSwapInfo();
  var _swapInfo$Field$INPUT = swapInfo[Field.INPUT],
      balance = _swapInfo$Field$INPUT.balance,
      tradeCurrencyAmount = _swapInfo$Field$INPUT.amount,
      tradeState = swapInfo.trade.state;

  var _useSwapAmount = useSwapAmount(Field.INPUT),
      _useSwapAmount2 = _slicedToArray__default["default"](_useSwapAmount, 2),
      inputAmount = _useSwapAmount2[0],
      updateInputAmount = _useSwapAmount2[1];

  var _useSwapCurrency = useSwapCurrency(Field.INPUT),
      _useSwapCurrency2 = _slicedToArray__default["default"](_useSwapCurrency, 2);
      _useSwapCurrency2[0];
      var updateInputCurrency = _useSwapCurrency2[1];

  var _useSwapAmount3 = useSwapAmount(Field.OUTPUT),
      _useSwapAmount4 = _slicedToArray__default["default"](_useSwapAmount3, 2),
      outputAmount = _useSwapAmount4[0],
      updateSwapOutputAmount = _useSwapAmount4[1];

  var _useSwapCurrency3 = useSwapCurrency(Field.OUTPUT),
      _useSwapCurrency4 = _slicedToArray__default["default"](_useSwapCurrency3, 2);
      _useSwapCurrency4[0];
      var updateSwapOutputCurrency = _useSwapCurrency4[1];

  var inputCurrencyAmount = useSwapCurrencyAmount(Field.INPUT);
  React.useEffect(function () {
    if (!input.amount) return;
    if (!input.currency) return;
    updateInputAmount(input.amount);
    updateInputCurrency(input.currency);
  }, [input.amount, input.currency]);
  React.useEffect(function () {
    if (!output.amount) return;
    if (!output.currency) return;
    updateSwapOutputAmount(output.amount);
    updateSwapOutputCurrency(output.currency);
  }, [output.amount, output.currency]);
  var isRouteLoading = input.disabled || tradeState === TradeState.SYNCING || tradeState === TradeState.LOADING;
  var isDependentField = !useIsSwapFieldIndependent(Field.INPUT);
  var isLoading = isRouteLoading && isDependentField;
  var max = React.useMemo(function () {
    var maxAmount = maxAmountSpend(balance);
    return maxAmount !== null && maxAmount !== void 0 && maxAmount.greaterThan(0) ? maxAmount.toExact() : undefined;
  }, [balance]);
  var formattedInputAmount = useFormattedFieldAmount({
    disabled: input.disabled,
    currencyAmount: tradeCurrencyAmount,
    fieldAmount: inputAmount
  });
  return {
    swapInfo: swapInfo,
    inputAmount: formattedInputAmount,
    output: output,
    max: max,
    isLoading: isLoading,
    inputCurrencyAmount: inputCurrencyAmount,
    outputAmount: outputAmount
  };
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var IntegrationError = /*#__PURE__*/function (_Error) {
  _inherits__default["default"](IntegrationError, _Error);

  var _super = _createSuper$2(IntegrationError);

  function IntegrationError(message) {
    var _this;

    _classCallCheck__default["default"](this, IntegrationError);

    _this = _super.call(this, message);
    _this.name = 'Integration Error';
    return _this;
  }

  return _createClass__default["default"](IntegrationError);
}( /*#__PURE__*/_wrapNativeSuper__default["default"](Error));

function isAddressOrAddressMap(addressOrMap) {
  if (_typeof__default["default"](addressOrMap) === 'object') {
    return Object.values(addressOrMap).every(function (address) {
      return isAddress(address);
    });
  }

  if (typeof addressOrMap === 'string') {
    return typeof isAddress(addressOrMap) === 'string';
  }

  return false;
}

function useValidate(props) {
  var convenienceFee = props.convenienceFee,
      convenienceFeeRecipient = props.convenienceFeeRecipient;
  React.useEffect(function () {
    if (convenienceFee) {
      if (convenienceFee > 100 || convenienceFee < 0) {
        throw new IntegrationError("convenienceFee must be between 0 and 100 (you set it to ".concat(convenienceFee, ")."));
      }

      if (!convenienceFeeRecipient) {
        throw new IntegrationError('convenienceFeeRecipient is required when convenienceFee is set.');
      }

      if (typeof convenienceFeeRecipient === 'string') {
        if (!isAddress(convenienceFeeRecipient)) {
          throw new IntegrationError("convenienceFeeRecipient must be a valid address (you set it to ".concat(convenienceFeeRecipient, ")."));
        }
      } else if (_typeof__default["default"](convenienceFeeRecipient) === 'object') {
        Object.values(convenienceFeeRecipient).forEach(function (recipient) {
          if (!isAddress(recipient)) {
            var values = Object.values(convenienceFeeRecipient).join(', ');
            throw new IntegrationError("All values in convenienceFeeRecipient object must be valid addresses (you used ".concat(values, ")."));
          }
        });
      }
    }
  }, [convenienceFee, convenienceFeeRecipient]);
  var defaultInputAmount = props.defaultInputAmount,
      defaultOutputAmount = props.defaultOutputAmount;
  React.useEffect(function () {
    if (defaultOutputAmount && defaultInputAmount) {
      throw new IntegrationError('defaultInputAmount and defaultOutputAmount may not both be defined.');
    }

    if (defaultInputAmount && (isNaN(+defaultInputAmount) || defaultInputAmount < 0)) {
      throw new IntegrationError("defaultInputAmount must be a positive number (you set it to ".concat(defaultInputAmount, ")"));
    }

    if (defaultOutputAmount && (isNaN(+defaultOutputAmount) || defaultOutputAmount < 0)) {
      throw new IntegrationError("defaultOutputAmount must be a positive number (you set it to ".concat(defaultOutputAmount, ")."));
    }
  }, [defaultInputAmount, defaultOutputAmount]);
  var defaultInputTokenAddress = props.defaultInputTokenAddress,
      defaultOutputTokenAddress = props.defaultOutputTokenAddress;
  React.useEffect(function () {
    if (defaultInputTokenAddress && !isAddressOrAddressMap(defaultInputTokenAddress) && defaultInputTokenAddress !== 'NATIVE') {
      throw new IntegrationError("defaultInputTokenAddress must be a valid address or \"NATIVE\" (you set it to ".concat(defaultInputTokenAddress, ")."));
    }

    if (defaultOutputTokenAddress && !isAddressOrAddressMap(defaultOutputTokenAddress) && defaultOutputTokenAddress !== 'NATIVE') {
      throw new IntegrationError("defaultOutputTokenAddress must be a valid address or \"NATIVE\" (you set it to ".concat(defaultOutputTokenAddress, ")."));
    }
  }, [defaultInputTokenAddress, defaultOutputTokenAddress]);
}

function Swap(props) {
  var _input$currency2, _output$currency2;

  useValidate(props);
  useSyncConvenienceFee(props);
  useSyncTokenDefaults(props);
  var dispatchSwapValues = useDispatchSwapValues();

  var _useSwapValues = useSwapValues(),
      _useSwapValues$uniswa = _useSwapValues.uniswap,
      input = _useSwapValues$uniswa.input,
      output = _useSwapValues$uniswa.output;

  var chainId = props.chainId;

  var _useActiveWeb3React = useActiveWeb3React(),
      active = _useActiveWeb3React.active;

  var onSupportedNetwork = useOnSupportedNetwork();
  var isDisabled = !(active && onSupportedNetwork);

  var _useState = React.useState(),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      inputCurrency = _useState2[0],
      setInputCurrency = _useState2[1];

  var _useState3 = React.useState(),
      _useState4 = _slicedToArray__default["default"](_useState3, 2),
      outputCurrency = _useState4[0],
      setOutputCurrency = _useState4[1];

  React.useEffect(function () {
    var _input$currency;

    if (!(input !== null && input !== void 0 && (_input$currency = input.currency) !== null && _input$currency !== void 0 && _input$currency.address)) return;
    setInputCurrency(new sdkCore.Token(chainId, input.currency.address, input.currency.decimals));
  }, [input === null || input === void 0 ? void 0 : (_input$currency2 = input.currency) === null || _input$currency2 === void 0 ? void 0 : _input$currency2.address]);
  React.useEffect(function () {
    var _output$currency;

    if (!(output !== null && output !== void 0 && (_output$currency = output.currency) !== null && _output$currency !== void 0 && _output$currency.address)) return;
    setOutputCurrency(new sdkCore.Token(chainId, output.currency.address, output.currency.decimals));
  }, [output === null || output === void 0 ? void 0 : (_output$currency2 = output.currency) === null || _output$currency2 === void 0 ? void 0 : _output$currency2.address]);
  React.useEffect(function () {
    var swapInput = useInput({
      input: {
        disabled: isDisabled,
        amount: input === null || input === void 0 ? void 0 : input.amount,
        currency: inputCurrency
      },
      output: {
        disabled: isDisabled,
        amount: output === null || output === void 0 ? void 0 : output.amount,
        currency: outputCurrency
      }
    });
    dispatchSwapValues({
      uniswap: {
        values: swapInput
      },
      type: 'setUniswapValues'
    });
  }, [input, output]);
  return /*#__PURE__*/React__default["default"].createElement(SwapInfoProvider, {
    disabled: isDisabled
  }, props.children);
}

var TransactionType;

(function (TransactionType) {
  TransactionType[TransactionType["APPROVAL"] = 0] = "APPROVAL";
  TransactionType[TransactionType["SWAP"] = 1] = "SWAP";
  TransactionType[TransactionType["WRAP"] = 2] = "WRAP";
})(TransactionType || (TransactionType = {}));

var transactionsAtom = immer.atomWithImmer({});

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function wait(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

function waitRandom(min, max) {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)));
}
/**
 * This error is thrown if the function is cancelled before completing
 */


var CancelledError = /*#__PURE__*/function (_Error) {
  _inherits__default["default"](CancelledError, _Error);

  var _super = _createSuper$1(CancelledError);

  function CancelledError() {
    var _this;

    _classCallCheck__default["default"](this, CancelledError);

    _this = _super.call(this, 'Cancelled');

    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isCancelledError", true);

    return _this;
  }

  return _createClass__default["default"](CancelledError);
}( /*#__PURE__*/_wrapNativeSuper__default["default"](Error));
/**
 * Throw this error if the function should retry
 */


var RetryableError = /*#__PURE__*/function (_Error2) {
  _inherits__default["default"](RetryableError, _Error2);

  var _super2 = _createSuper$1(RetryableError);

  function RetryableError() {
    var _this2;

    _classCallCheck__default["default"](this, RetryableError);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this2 = _super2.call.apply(_super2, [this].concat(args));

    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "isRetryableError", true);

    return _this2;
  }

  return _createClass__default["default"](RetryableError);
}( /*#__PURE__*/_wrapNativeSuper__default["default"](Error));

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 */
function retry(fn, _ref) {
  var n = _ref.n,
      minWait = _ref.minWait,
      maxWait = _ref.maxWait;
  var completed = false;
  var rejectCancelled;
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(resolve, reject) {
      var result;
      return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              rejectCancelled = reject;

            case 1:

              result = void 0;
              _context.prev = 3;
              _context.next = 6;
              return fn();

            case 6:
              result = _context.sent;

              if (!completed) {
                resolve(result);
                completed = true;
              }

              return _context.abrupt("break", 24);

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](3);

              if (!completed) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("break", 24);

            case 15:
              if (!(n <= 0 || !_context.t0.isRetryableError)) {
                _context.next = 19;
                break;
              }

              reject(_context.t0);
              completed = true;
              return _context.abrupt("break", 24);

            case 19:
              n--;

            case 20:
              _context.next = 22;
              return waitRandom(minWait, maxWait);

            case 22:
              _context.next = 1;
              break;

            case 24:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 11]]);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  return {
    promise: promise,
    cancel: function cancel() {
      if (completed) return;
      completed = true;
      rejectCancelled(new CancelledError());
    }
  };
}

var _RETRY_OPTIONS_BY_CHA;
function shouldCheck(lastBlockNumber, tx) {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  var blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  var minutesPending = (new Date().getTime() - tx.addedTime) / 60000;

  if (minutesPending > 60) {
    // every 10 blocks if pending longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending longer than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}
var RETRY_OPTIONS_BY_CHAIN_ID = (_RETRY_OPTIONS_BY_CHA = {}, _defineProperty__default["default"](_RETRY_OPTIONS_BY_CHA, exports.SupportedChainId.ARBITRUM_ONE, {
  n: 10,
  minWait: 250,
  maxWait: 1000
}), _defineProperty__default["default"](_RETRY_OPTIONS_BY_CHA, exports.SupportedChainId.ARBITRUM_RINKEBY, {
  n: 10,
  minWait: 250,
  maxWait: 1000
}), _defineProperty__default["default"](_RETRY_OPTIONS_BY_CHA, exports.SupportedChainId.OPTIMISTIC_KOVAN, {
  n: 10,
  minWait: 250,
  maxWait: 1000
}), _defineProperty__default["default"](_RETRY_OPTIONS_BY_CHA, exports.SupportedChainId.OPTIMISM, {
  n: 10,
  minWait: 250,
  maxWait: 1000
}), _RETRY_OPTIONS_BY_CHA);
var DEFAULT_RETRY_OPTIONS = {
  n: 1,
  minWait: 0,
  maxWait: 0
};
function Updater(_ref) {
  var pendingTransactions = _ref.pendingTransactions,
      onCheck = _ref.onCheck,
      onReceipt = _ref.onReceipt;

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId,
      library = _useActiveWeb3React.library;

  var lastBlockNumber = useBlockNumber();
  var fastForwardBlockNumber = useFastForwardBlockNumber();
  var getReceipt = React.useCallback(function (hash) {
    var _RETRY_OPTIONS_BY_CHA2;

    if (!library || !chainId) throw new Error('No library or chainId');
    var retryOptions = (_RETRY_OPTIONS_BY_CHA2 = RETRY_OPTIONS_BY_CHAIN_ID[chainId]) !== null && _RETRY_OPTIONS_BY_CHA2 !== void 0 ? _RETRY_OPTIONS_BY_CHA2 : DEFAULT_RETRY_OPTIONS;
    return retry(function () {
      return library.getTransactionReceipt(hash).then(function (receipt) {
        if (receipt === null) {
          console.debug("Retrying tranasaction receipt for ".concat(hash));
          throw new RetryableError();
        }

        return receipt;
      });
    }, retryOptions);
  }, [chainId, library]);
  React.useEffect(function () {
    if (!chainId || !library || !lastBlockNumber) return;
    var cancels = Object.keys(pendingTransactions).filter(function (hash) {
      return shouldCheck(lastBlockNumber, pendingTransactions[hash]);
    }).map(function (hash) {
      var _getReceipt = getReceipt(hash),
          promise = _getReceipt.promise,
          cancel = _getReceipt.cancel;

      promise.then(function (receipt) {
        if (receipt) {
          onReceipt({
            chainId: chainId,
            hash: hash,
            receipt: receipt
          });
        } else {
          onCheck({
            chainId: chainId,
            hash: hash,
            blockNumber: lastBlockNumber
          });
        }
      }).catch(function (error) {
        if (!error.isCancelledError) {
          console.warn("Failed to get transaction receipt for ".concat(hash), error);
        }
      });
      return cancel;
    });
    return function () {
      cancels.forEach(function (cancel) {
        return cancel();
      });
    };
  }, [chainId, library, lastBlockNumber, getReceipt, fastForwardBlockNumber, onReceipt, onCheck, pendingTransactions]);
  return null;
}

function usePendingTransactions() {
  var _ref;

  var _useActiveWeb3React = useActiveWeb3React(),
      chainId = _useActiveWeb3React.chainId;

  var txs = utils.useAtomValue(transactionsAtom);
  return (_ref = chainId ? txs[chainId] : null) !== null && _ref !== void 0 ? _ref : {};
}
function TransactionsUpdater() {
  var pendingTransactions = usePendingTransactions();
  var updateTxs = utils.useUpdateAtom(transactionsAtom);
  var onCheck = React.useCallback(function (_ref2) {
    var chainId = _ref2.chainId,
        hash = _ref2.hash,
        blockNumber = _ref2.blockNumber;
    updateTxs(function (txs) {
      var _txs$chainId;

      var tx = (_txs$chainId = txs[chainId]) === null || _txs$chainId === void 0 ? void 0 : _txs$chainId[hash];

      if (tx) {
        tx.lastCheckedBlockNumber = tx.lastCheckedBlockNumber ? Math.max(tx.lastCheckedBlockNumber, blockNumber) : blockNumber;
      }
    });
  }, [updateTxs]);
  var onReceipt = React.useCallback(function (_ref3) {
    var chainId = _ref3.chainId,
        hash = _ref3.hash,
        receipt = _ref3.receipt;
    updateTxs(function (txs) {
      var _txs$chainId2;

      var tx = (_txs$chainId2 = txs[chainId]) === null || _txs$chainId2 === void 0 ? void 0 : _txs$chainId2[hash];

      if (tx) {
        tx.receipt = receipt;
      }
    });
  }, [updateTxs]);
  return /*#__PURE__*/React__default["default"].createElement(Updater, {
    pendingTransactions: pendingTransactions,
    onCheck: onCheck,
    onReceipt: onReceipt
  });
}

var LinguiContext = /*#__PURE__*/React__default["default"].createContext(null);

function useLingui() {
  var context = React__default["default"].useContext(LinguiContext);
  {
    if (context == null) {
      throw new Error("useLingui hook was used without I18nProvider.");
    }
  }
  return context;
}

function withI18n(o) {
  return function (WrappedComponent) {
    return function (props) {
      {
        if (typeof o === "function" || /*#__PURE__*/React__default["default"].isValidElement(o)) {
          throw new Error("withI18n([options]) takes options as a first argument, " + "but received React component itself. Without options, the Component " + "should be wrapped as withI18n()(Component), not withI18n(Component).");
        }
      }

      var _useLingui = useLingui(),
          i18n = _useLingui.i18n;

      return /*#__PURE__*/React__default["default"].createElement(WrappedComponent, Object.assign({}, props, {
        i18n: i18n
      }));
    };
  };
}

var I18nProvider = function I18nProvider(_ref) {
  var i18n = _ref.i18n,
      defaultComponent = _ref.defaultComponent,
      _ref$forceRenderOnLoc = _ref.forceRenderOnLocaleChange,
      forceRenderOnLocaleChange = _ref$forceRenderOnLoc === void 0 ? true : _ref$forceRenderOnLoc,
      children = _ref.children;
  /**
   * We can't pass `i18n` object directly through context, because even when locale
   * or messages are changed, i18n object is still the same. Context provider compares
   * reference identity and suggested workaround is create a wrapper object every time
   * we need to trigger re-render. See https://reactjs.org/docs/context.html#caveats.
   *
   * Due to this effect we also pass `defaultComponent` in the same context, instead
   * of creating a separate Provider/Consumer pair.
   *
   * We can't use useMemo hook either, because we want to recalculate value manually.
   */

  var makeContext = function makeContext() {
    return {
      i18n: i18n,
      defaultComponent: defaultComponent
    };
  };

  var getRenderKey = function getRenderKey() {
    return forceRenderOnLocaleChange ? i18n.locale || 'default' : 'default';
  };

  var _React$useState = React__default["default"].useState(makeContext()),
      _React$useState2 = _slicedToArray__default["default"](_React$useState, 2),
      context = _React$useState2[0],
      setContext = _React$useState2[1],
      _React$useState3 = React__default["default"].useState(getRenderKey()),
      _React$useState4 = _slicedToArray__default["default"](_React$useState3, 2),
      renderKey = _React$useState4[0],
      setRenderKey = _React$useState4[1];
  /**
   * Subscribe for locale/message changes
   *
   * I18n object from `@lingui/core` is the single source of truth for all i18n related
   * data (active locale, catalogs). When new messages are loaded or locale is changed
   * we need to trigger re-rendering of LinguiContext.Consumers.
   *
   * We call `setContext(makeContext())` after adding the observer in case the `change`
   * event would already have fired between the inital renderKey calculation and the
   * `useEffect` hook being called. This can happen if locales are loaded/activated
   * async.
   */


  React__default["default"].useEffect(function () {
    var unsubscribe = i18n.on("change", function () {
      setContext(makeContext());
      setRenderKey(getRenderKey());
    });

    if (renderKey === 'default') {
      setRenderKey(getRenderKey());
    }

    if (forceRenderOnLocaleChange && renderKey === 'default') {
      console.log("I18nProvider did not render. A call to i18n.activate still needs to happen or forceRenderOnLocaleChange must be set to false.");
    }

    return function () {
      return unsubscribe();
    };
  }, []);
  if (forceRenderOnLocaleChange && renderKey === 'default') return null;
  return /*#__PURE__*/React__default["default"].createElement(LinguiContext.Provider, {
    value: context,
    key: renderKey
  }, children);
};

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function F() {};

      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

var tagRe = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/;
var nlRe = /(?:\r\n|\r|\n)/g; // For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special-case tags.

var voidElementTags = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  menuitem: true
};
/**
 * `formatElements` - parse string and return tree of react elements
 *
 * `value` is string to be formatted with <0>Paired<0/> or <0/> (unpaired)
 * placeholders. `elements` is a array of react elements which indexes
 * correspond to element indexes in formatted string
 */

function formatElements(value) {
  var elements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var uniqueId = makeCounter(0, '$lingui$');
  var parts = value.replace(nlRe, "").split(tagRe); // no inline elements, return

  if (parts.length === 1) return value;
  var tree = [];
  var before = parts.shift();
  if (before) tree.push(before);

  var _iterator = _createForOfIteratorHelper(getElements(parts)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray__default["default"](_step.value, 3),
          index = _step$value[0],
          children = _step$value[1],
          after = _step$value[2];

      var element = elements[index];

      if (!element || voidElementTags[element.type] && children) {
        if (!element) {
          console.error("Can use element at index '".concat(index, "' as it is not declared in the original translation"));
        } else {
          console.error("".concat(element.type, " is a void element tag therefore it must have no children"));
        } // ignore problematic element but push its children and elements after it


        element = /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment);
      }

      tree.push( /*#__PURE__*/React__default["default"].cloneElement(element, {
        key: uniqueId()
      }, // format children for pair tags
      // unpaired tags might have children if it's a component passed as a variable
      children ? formatElements(children, elements) : element.props.children));
      if (after) tree.push(after);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return tree;
}
/*
 * `getElements` - return array of element indexes and element childrens
 *
 * `parts` is array of [pairedIndex, children, unpairedIndex, textAfter, ...]
 * where:
 * - `pairedIndex` is index of paired element (undef for unpaired)
 * - `children` are children of paired element (undef for unpaired)
 * - `unpairedIndex` is index of unpaired element (undef for paired)
 * - `textAfter` is string after all elements (empty string, if there's nothing)
 *
 * `parts` length is always multiply of 4
 *
 * Returns: Array<[elementIndex, children, after]>
 */


function getElements(parts) {
  if (!parts.length) return [];

  var _parts$slice = parts.slice(0, 4),
      _parts$slice2 = _slicedToArray__default["default"](_parts$slice, 4),
      paired = _parts$slice2[0],
      children = _parts$slice2[1],
      unpaired = _parts$slice2[2],
      after = _parts$slice2[3];

  return [[parseInt(paired || unpaired), children || "", after]].concat(getElements(parts.slice(4, parts.length)));
}

var makeCounter = function makeCounter() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  return function () {
    return "".concat(prefix, "_").concat(count++);
  };
};

function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread$2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys$2(Object(source), true).forEach(function (key) {
        _defineProperty__default["default"](target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$2(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function Trans$1(props) {
  var _useLingui = useLingui(),
      i18n = _useLingui.i18n,
      defaultComponent = _useLingui.defaultComponent;

  var render = props.render,
      component = props.component,
      id = props.id,
      message = props.message,
      formats = props.formats;

  var values = _objectSpread$2({}, props.values);

  var components = _objectSpread$2({}, props.components);

  if (values) {
    /*
      Related discussion: https://github.com/lingui/js-lingui/issues/183
           Values *might* contain React elements with static content.
      They're replaced with <INDEX /> placeholders and added to `components`.
           Example:
      Translation: Hello {name}
      Values: { name: <strong>Jane</strong> }
           It'll become "Hello <0 />" with components=[<strong>Jane</strong>]
      */
    Object.keys(values).forEach(function (key) {
      var value = values[key];
      if (! /*#__PURE__*/React__default["default"].isValidElement(value)) return;
      var index = Object.keys(components).length;
      components[index] = value;
      values[key] = "<".concat(index, "/>");
    });
  }

  var _translation = i18n && typeof i18n._ === "function" ? i18n._(id, values, {
    message: message,
    formats: formats
  }) : id; // i18n provider isn't loaded at all


  var translation = _translation ? formatElements(_translation, components) : null;

  if (render === null || component === null) {
    // Although `string` is a valid react element, types only allow `Element`
    // Upstream issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
    return translation;
  }

  var FallbackComponent = defaultComponent || React__default["default"].Fragment; // Validation of `render` and `component` props

  if (render && component) {
    console.error("You can't use both `component` and `render` prop at the same time. `component` is ignored.");
  } else if (render && typeof render !== "function") {
    console.error("Invalid value supplied to prop `render`. It must be a function, provided ".concat(render));
  } else if (component && typeof component !== "function") {
    // Apparently, both function components and class components are functions
    // See https://stackoverflow.com/a/41658173/1535540
    console.error("Invalid value supplied to prop `component`. It must be a React component, provided ".concat(component));
    return /*#__PURE__*/React__default["default"].createElement(FallbackComponent, null, translation);
  } // Rendering using a render prop


  if (typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render({
      id: id,
      translation: translation,
      message: message
    });
  } // `component` prop has a higher precedence over `defaultComponent`


  var Component = component || FallbackComponent;
  return /*#__PURE__*/React__default["default"].createElement(Component, null, translation);
}

Trans$1.defaultProps = {
  values: {},
  components: {}
};

var r = /*#__PURE__*/React__default["default"].createContext(null);

function o() {
  var e = React__default["default"].useContext(r);
  return e;
}

function a(e) {
  return function (e) {
    return function (t) {
      var r = o(),
          a = r.i18n;
      return /*#__PURE__*/React__default["default"].createElement(e, Object.assign({}, t, {
        i18n: a
      }));
    };
  };
}

var i = function i(t) {
  var o = t.i18n,
      a = t.defaultComponent,
      i = t.forceRenderOnLocaleChange,
      c = void 0 === i || i,
      u = t.children,
      l = function l() {
    return {
      i18n: o,
      defaultComponent: a
    };
  },
      f = function f() {
    return c && o.locale || "default";
  },
      s = React__default["default"].useState(l()),
      p = _slicedToArray__default["default"](s, 2),
      m = p[0],
      d = p[1],
      v = React__default["default"].useState(f()),
      y = _slicedToArray__default["default"](v, 2),
      h = y[0],
      b = y[1];

  return React__default["default"].useEffect(function () {
    var e = o.on("change", function () {
      d(l()), b(f());
    });
    return "default" === h && b(f()), c && "default" === h && console.log("I18nProvider did not render. A call to i18n.activate still needs to happen or forceRenderOnLocaleChange must be set to false."), function () {
      return e();
    };
  }, []), c && "default" === h ? null : /*#__PURE__*/React__default["default"].createElement(r.Provider, {
    value: m,
    key: h
  }, u);
};

function c(e, n) {
  var t;

  if ("undefined" == typeof Symbol || null == e[Symbol.iterator]) {
    if (Array.isArray(e) || (t = function (e, n) {
      if (!e) return;
      if ("string" == typeof e) return u(e, n);
      var t = Object.prototype.toString.call(e).slice(8, -1);
      "Object" === t && e.constructor && (t = e.constructor.name);
      if ("Map" === t || "Set" === t) return Array.from(e);
      if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return u(e, n);
    }(e)) || n && e && "number" == typeof e.length) {
      t && (e = t);

      var r = 0,
          o = function o() {};

      return {
        s: o,
        n: function n() {
          return r >= e.length ? {
            done: !0
          } : {
            done: !1,
            value: e[r++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: o
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var a,
      i = !0,
      c = !1;
  return {
    s: function s() {
      t = e[Symbol.iterator]();
    },
    n: function n() {
      var e = t.next();
      return i = e.done, e;
    },
    e: function e(_e2) {
      c = !0, a = _e2;
    },
    f: function f() {
      try {
        i || null == t.return || t.return();
      } finally {
        if (c) throw a;
      }
    }
  };
}

function u(e, n) {
  (null == n || n > e.length) && (n = e.length);

  for (var t = 0, r = new Array(n); t < n; t++) {
    r[t] = e[t];
  }

  return r;
}

var l = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/,
    f = /(?:\r\n|\r|\n)/g,
    s = {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  embed: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0,
  menuitem: !0
};

function p(n) {
  if (!n.length) return [];
  var t = n.slice(0, 4),
      r = _slicedToArray__default["default"](t, 4),
      o = r[0],
      a = r[1],
      i = r[2],
      c = r[3];
  return [[parseInt(o || i), a || "", c]].concat(p(n.slice(4, n.length)));
}

var m = function m() {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
      n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
  return function () {
    return "".concat(n, "_").concat(e++);
  };
};

function d(e, n) {
  var t = Object.keys(e);

  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    n && (r = r.filter(function (n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, r);
  }

  return t;
}

function v(e) {
  for (var n = 1; n < arguments.length; n++) {
    var r = null != arguments[n] ? arguments[n] : {};
    n % 2 ? d(Object(r), !0).forEach(function (n) {
      _defineProperty__default["default"](e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : d(Object(r)).forEach(function (n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }

  return e;
}

function y(t) {
  var r = o(),
      a = r.i18n,
      i = r.defaultComponent,
      u = t.render,
      d = t.component,
      y = t.id,
      h = t.message,
      b = t.formats,
      g = v({}, t.values),
      O = v({}, t.components);
  g && Object.keys(g).forEach(function (e) {
    var t = g[e];

    if ( /*#__PURE__*/React__default["default"].isValidElement(t)) {
      var r = Object.keys(O).length;
      O[r] = t, g[e] = "<".concat(r, "/>");
    }
  });
  var j = a && "function" == typeof a._ ? a._(y, g, {
    message: h,
    formats: b
  }) : y,
      w = j ? function t(r) {
    var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        a = m(0, "$lingui$"),
        i = r.replace(f, "").split(l);
    if (1 === i.length) return r;
    var u = [],
        d = i.shift();
    d && u.push(d);
    var v,
        y = c(p(i));

    try {
      for (y.s(); !(v = y.n()).done;) {
        var h = _slicedToArray__default["default"](v.value, 3),
            b = h[0],
            g = h[1],
            O = h[2],
            j = o[b];
        (!j || s[j.type] && g) && (j ? console.error("".concat(j.type, " is a void element tag therefore it must have no children")) : console.error("Can use element at index '".concat(b, "' as it is not declared in the original translation")), j = /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment)), u.push( /*#__PURE__*/React__default["default"].cloneElement(j, {
          key: a()
        }, g ? t(g, o) : j.props.children)), O && u.push(O);
      }
    } catch (e) {
      y.e(e);
    } finally {
      y.f();
    }

    return u;
  }(j, O) : null;
  if (null === u || null === d) return w;
  var E = i || React__default["default"].Fragment;
  if (u && d) console.error("You can't use both `component` and `render` prop at the same time. `component` is ignored.");else if (u && "function" != typeof u) console.error("Invalid value supplied to prop `render`. It must be a function, provided ".concat(u));else if (d && "function" != typeof d) return console.error("Invalid value supplied to prop `component`. It must be a React component, provided ".concat(d)), /*#__PURE__*/React__default["default"].createElement(E, null, w);
  if ("function" == typeof u) return u({
    id: y,
    translation: w,
    message: h
  });
  var P = d || E;
  return /*#__PURE__*/React__default["default"].createElement(P, null, w);
}

y.defaultProps = {
  values: {},
  components: {}
};

process.env.NODE_ENV === "production" ? i : I18nProvider;
var Trans = process.env.NODE_ENV === "production" ? y : Trans$1;
process.env.NODE_ENV === "production" ? o : useLingui;
process.env.NODE_ENV === "production" ? a : withI18n;

var _defs, _path$1;

function _extends$2() { _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }

var SvgAutoRouter = function SvgAutoRouter(props) {
  return /*#__PURE__*/React__default["default"].createElement("svg", _extends$2({
    width: 23,
    height: 20,
    viewBox: "0 0 23 20",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _defs || (_defs = /*#__PURE__*/React__default["default"].createElement("defs", null, /*#__PURE__*/React__default["default"].createElement("linearGradient", {
    id: "gradient",
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    gradientTransform: "rotate(95)"
  }, /*#__PURE__*/React__default["default"].createElement("stop", {
    id: "stop1",
    offset: 0,
    stopColor: "#2274E2"
  }), /*#__PURE__*/React__default["default"].createElement("stop", {
    id: "stop1",
    offset: 0.5,
    stopColor: "#2274E2"
  }), /*#__PURE__*/React__default["default"].createElement("stop", {
    id: "stop2",
    offset: 1,
    stopColor: "#3FB672"
  })))), _path$1 || (_path$1 = /*#__PURE__*/React__default["default"].createElement("path", {
    d: "M16 16C10 16 9 10 5 10M16 16C16 17.6569 17.3431 19 19 19C20.6569 19 22 17.6569 22 16C22 14.3431 20.6569 13 19 13C17.3431 13 16 14.3431 16 16ZM5 10C9 10 10 4 16 4M5 10H1.5M16 4C16 5.65685 17.3431 7 19 7C20.6569 7 22 5.65685 22 4C22 2.34315 20.6569 1 19 1C17.3431 1 16 2.34315 16 4Z",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    stroke: "url(#gradient)"
  })));
};

var _polyline, _polyline2;

function _extends$1() { _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }

var SvgExpando = function SvgExpando(props) {
  return /*#__PURE__*/React__default["default"].createElement("svg", _extends$1({
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _polyline || (_polyline = /*#__PURE__*/React__default["default"].createElement("polyline", {
    className: "left",
    points: "18 15 12 9"
  })), _polyline2 || (_polyline2 = /*#__PURE__*/React__default["default"].createElement("polyline", {
    className: "right",
    points: "12 9 6 15"
  })));
};

var _path, _path2, _path3;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgWallet = function SvgWallet(props) {
  return /*#__PURE__*/React__default["default"].createElement("svg", _extends({
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/React__default["default"].createElement("path", {
    d: "M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V7Z",
    stroke: "currentColor",
    strokeWidth: 2
  })), _path2 || (_path2 = /*#__PURE__*/React__default["default"].createElement("path", {
    d: "M4 19H20C21.1046 19 22 18.1046 22 17V14C22 12.8954 21.1046 12 20 12H16C15.4477 12 14.9935 12.4624 14.7645 12.965C14.4438 13.6688 13.789 14.5 12 14.5C10.29 14.5 9.48213 13.7406 9.1936 13.0589C8.96576 12.5206 8.49905 12 7.91447 12H4C2.89543 12 2 12.8954 2 14V17C2 18.1046 2.89543 19 4 19Z",
    fill: "currentColor"
  })), _path3 || (_path3 = /*#__PURE__*/React__default["default"].createElement("path", {
    d: "M22 13V11C22 9.89543 21.1034 9 19.9989 9C14.0294 9 9.97062 9 4.00115 9C2.89658 9 2 9.89543 2 11V13",
    stroke: "currentColor",
    strokeWidth: 2
  })));
};

var _templateObject$2, _templateObject2$1;

function icon(Icon) {
  return _styled__default["default"](Icon).withConfig({
    displayName: "icons",
    componentId: "sc-lekdau-0"
  })(["clip-path:stroke-box;height:1em;stroke:", ";width:1em;"], function (_ref) {
    var _ref$color = _ref.color,
        color = _ref$color === void 0 ? 'currentColor' : _ref$color,
        theme = _ref.theme;
    return theme[color];
  });
}

var largeIconCss = _styled.css(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral__default["default"](["\n  display: flex;\n\n  svg {\n    align-self: center;\n    height: ", "em;\n    width: ", "em;\n  }\n"])), function (_ref2) {
  var iconSize = _ref2.iconSize;
  return iconSize;
}, function (_ref3) {
  var iconSize = _ref3.iconSize;
  return iconSize;
});

var LargeWrapper = /*#__PURE__*/_styled__default["default"].div.withConfig({
  displayName: "icons__LargeWrapper",
  componentId: "sc-lekdau-1"
})(["height:1em;width:", "em;", ""], function (_ref4) {
  var iconSize = _ref4.iconSize;
  return iconSize;
}, largeIconCss);

function LargeIcon(_ref5) {
  var Icon = _ref5.icon,
      color = _ref5.color,
      _ref5$size = _ref5.size,
      size = _ref5$size === void 0 ? 1.2 : _ref5$size,
      className = _ref5.className;
  return /*#__PURE__*/React__default["default"].createElement(LargeWrapper, {
    color: color,
    iconSize: size,
    className: className
  }, Icon && /*#__PURE__*/React__default["default"].createElement(Icon, {
    color: color
  }));
}
var AlertTriangle = icon(reactFeather.AlertTriangle);
icon(reactFeather.ArrowDown);
icon(reactFeather.ArrowRight);
icon(reactFeather.ArrowUp);
icon(reactFeather.CheckCircle);
icon(reactFeather.BarChart2);
icon(reactFeather.ChevronDown);
icon(reactFeather.Clock);
icon(reactFeather.HelpCircle);
icon(reactFeather.Info);
icon(reactFeather.ExternalLink);
icon(SvgAutoRouter);
icon(reactFeather.Settings);
icon(reactFeather.Slash);
icon(reactFeather.Trash2);
icon(SvgWallet);
icon(reactFeather.X);
icon(reactFeather.XOctagon);
var Expando$1 = /*#__PURE__*/_styled__default["default"](icon(SvgExpando)).withConfig({
  displayName: "icons__Expando",
  componentId: "sc-lekdau-3"
})([".left,.right{transition:transform 0.25s ease-in-out;will-change:transform;}.left{transform:", ";}.right{transform:", ";}"], function (_ref7) {
  var open = _ref7.open;
  return open ? undefined : 'translateX(-25%)';
}, function (_ref8) {
  var open = _ref8.open;
  return open ? undefined : 'translateX(25%)';
});

_styled.keyframes(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral__default["default"](["\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n"])));

var black$1 = 'hsl(0, 0%, 0%)';
var white$1 = 'hsl(0, 0%, 100%)';
({
  // surface
  interactive: polished.transparentize(1 - 0.54, black$1),
  outline: polished.transparentize(1 - 0.24, black$1),
  // text
  primary: black$1,
  secondary: polished.transparentize(1 - 0.64, black$1),
  onInteractive: white$1
});
({
  // surface
  interactive: polished.transparentize(1 - 0.48, white$1),
  outline: polished.transparentize(1 - 0.12, white$1),
  // text
  primary: white$1,
  secondary: polished.transparentize(1 - 0.6, white$1),
  onInteractive: black$1
});

var Layer;

(function (Layer) {
  Layer[Layer["UNDERLAYER"] = -1] = "UNDERLAYER";
  Layer[Layer["OVERLAY"] = 100] = "OVERLAY";
  Layer[Layer["DIALOG"] = 1000] = "DIALOG";
  Layer[Layer["TOOLTIP"] = 2000] = "TOOLTIP";
})(Layer || (Layer = {}));

var TextWrapper = /*#__PURE__*/_styled__default["default"](rebass.Text).withConfig({
  displayName: "type__TextWrapper",
  componentId: "sc-16386l-0"
})(["color:", ";min-height:", ";user-select:", ";white-space:", ";"], function (_ref) {
  var _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'currentColor' : _ref$color,
      theme = _ref.theme;
  return theme[color];
}, function (_ref2) {
  var lineHeight = _ref2.lineHeight;
  return lineHeight;
}, function (_ref3) {
  var userSelect = _ref3.userSelect;
  return userSelect && 'text';
}, function (_ref4) {
  var noWrap = _ref4.noWrap;
  return noWrap && 'nowrap';
});

var TransitionTextWrapper = /*#__PURE__*/_styled__default["default"](TextWrapper).withConfig({
  displayName: "type__TransitionTextWrapper",
  componentId: "sc-16386l-1"
})(["transition:font-size 0.25s ease-out,line-height 0.25s ease-out;"]);
function Subhead1(props) {
  return /*#__PURE__*/React__default["default"].createElement(TextWrapper, _extends__default["default"]({
    className: "subhead subhead-1",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "16px",
    noWrap: true
  }, props));
}
function Subhead2(props) {
  return /*#__PURE__*/React__default["default"].createElement(TextWrapper, _extends__default["default"]({
    className: "subhead subhead-2",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "14px",
    noWrap: true
  }, props));
}
function Body2(props) {
  return /*#__PURE__*/React__default["default"].createElement(TextWrapper, _extends__default["default"]({
    className: "body body-2",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "20px"
  }, props));
}
function TransitionButton(props) {
  var className = "button button-".concat(props.buttonSize);
  var fontSize = {
    small: 14,
    medium: 16,
    large: 20
  }[props.buttonSize];
  var lineHeight = "".concat(fontSize, "px");
  return /*#__PURE__*/React__default["default"].createElement(TransitionTextWrapper, _extends__default["default"]({
    className: className,
    fontSize: fontSize,
    fontWeight: 500,
    lineHeight: lineHeight,
    noWrap: true
  }, props));
}
function Code(props) {
  var _useTheme2 = _styled.useTheme(),
      fontFamilyCode = _useTheme2.fontFamilyCode;

  return /*#__PURE__*/React__default["default"].createElement(TextWrapper, _extends__default["default"]({
    className: "code",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "16px",
    fontFamily: fontFamilyCode
  }, props));
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var white = 'hsl(0, 0%, 100%)';
var black = 'hsl(0, 0%, 0%)';
var brandLight = 'hsl(331.3, 100%, 50%)';
var brandDark = 'hsl(215, 79%, 51.4%)';
var stateColors = {
  active: 'hsl(215, 79%, 51.4%)',
  success: 'hsl(145, 63.4%, 41.8%)',
  warning: 'hsl(43, 89.9%, 53.5%)',
  error: 'hsl(0, 98%, 62.2%)'
};
var lightTheme = _objectSpread$1(_objectSpread$1({
  // surface
  accent: brandLight,
  container: 'hsl(220, 23%, 97.5%)',
  module: 'hsl(231, 14%, 90%)',
  interactive: 'hsl(229, 13%, 83%)',
  outline: 'hsl(225, 7%, 78%)',
  dialog: white,
  // text
  onAccent: white,
  primary: black,
  secondary: 'hsl(227, 10%, 37.5%)',
  hint: 'hsl(224, 9%, 57%)',
  onInteractive: black
}, stateColors), {}, {
  currentColor: 'currentColor'
});
var darkTheme = _objectSpread$1(_objectSpread$1({
  // surface
  accent: brandDark,
  container: 'hsl(220, 10.7%, 11%)',
  module: 'hsl(222, 10.2%, 19.2%)',
  interactive: 'hsl(224, 10%, 28%)',
  outline: 'hsl(227, 10%, 37.5%)',
  dialog: black,
  // text
  onAccent: white,
  primary: white,
  secondary: 'hsl(224, 8.7%, 57.1%)',
  hint: 'hsl(225, 10%, 47.1%)',
  onInteractive: white
}, stateColors), {}, {
  currentColor: 'currentColor'
});
var defaultTheme = _objectSpread$1({
  borderRadius: 1,
  fontFamily: {
    font: '"Inter", sans-serif',
    variable: '"InterVariable", sans-serif'
  },
  fontFamilyCode: 'IBM Plex Mono',
  tokenColorExtraction: false
}, lightTheme);
var ThemeContext = /*#__PURE__*/React.createContext(toComputedTheme(defaultTheme));
function ThemeProvider(_ref) {
  var theme = _ref.theme,
      children = _ref.children;
  var contextTheme = React.useContext(ThemeContext);
  var value = React.useMemo(function () {
    return toComputedTheme(_objectSpread$1(_objectSpread$1({}, contextTheme), theme));
  }, [contextTheme, theme]);
  return /*#__PURE__*/React__default["default"].createElement(ThemeContext.Provider, {
    value: value
  }, /*#__PURE__*/React__default["default"].createElement(_styled.ThemeProvider, {
    theme: value
  }, children));
}

function toComputedTheme(theme) {
  return _objectSpread$1(_objectSpread$1({}, theme), {}, {
    borderRadius: clamp(Number.isFinite(theme.borderRadius) ? theme.borderRadius : theme.borderRadius ? 1 : 0),
    onHover: function onHover(color) {
      return color === theme.primary ? polished.transparentize(0.4, theme.primary) : polished.mix(0.16, theme.primary, color);
    }
  });

  function clamp(value) {
    return Math.min(Math.max(value, 0), 1);
  }
}

function isAnimating(node) {
  var _node$getAnimations$l;

  return ((_node$getAnimations$l = node.getAnimations().length) !== null && _node$getAnimations$l !== void 0 ? _node$getAnimations$l : 0) > 0;
}
var UNMOUNTING = 'unmounting';
/**
 * Delays a node's unmounting until any animations on that node are finished, so that an unmounting
 * animation may be applied. If there is no animation, this is a no-op.
 *
 * CSS should target the UNMOUNTING class to determine when to apply an unmounting animation.
 */

function delayUnmountForAnimation(node) {
  var current = node.current;
  var parent = current === null || current === void 0 ? void 0 : current.parentElement;
  var removeChild = parent === null || parent === void 0 ? void 0 : parent.removeChild;

  if (parent && removeChild) {
    parent.removeChild = function (child) {
      if (child === current) {
        current.classList.add(UNMOUNTING);

        if (isAnimating(current)) {
          current.addEventListener('animationend', function () {
            removeChild.call(parent, child);
          });
        } else {
          removeChild.call(parent, child);
        }

        return child;
      } else {
        return removeChild.call(parent, child);
      }
    };
  }
}

var _excluded$1 = ["icon", "iconProps"];

var _templateObject$1;
var BaseButton = /*#__PURE__*/_styled__default["default"].button.withConfig({
  displayName: "Button__BaseButton",
  componentId: "sc-1soikk5-0"
})(["background-color:transparent;border:none;border-radius:0.5em;color:currentColor;cursor:pointer;font-size:inherit;font-weight:inherit;height:inherit;line-height:inherit;margin:0;padding:0;:enabled{transition:filter 0.125s linear;}:disabled{cursor:initial;filter:opacity(0.4);}"]);

var transitionCss = _styled.css(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral__default["default"](["\n  transition: background-color 0.125s linear, border-color 0.125s linear, filter 0.125s linear;\n"])));

var Button = _styled__default["default"](BaseButton).withConfig({
  displayName: "Button",
  componentId: "sc-1soikk5-1"
})(["background-color:", ";border:1px solid transparent;color:", ";:enabled{", ";}:enabled:hover{background-color:", ";}"], function (_ref) {
  var _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'interactive' : _ref$color,
      theme = _ref.theme;
  return theme[color];
}, function (_ref2) {
  var _ref2$color = _ref2.color,
      color = _ref2$color === void 0 ? 'interactive' : _ref2$color,
      theme = _ref2.theme;
  return color === 'interactive' && theme.onInteractive;
}, function (_ref3) {
  var _ref3$transition = _ref3.transition,
      transition = _ref3$transition === void 0 ? true : _ref3$transition;
  return transition && transitionCss;
}, function (_ref4) {
  var _ref4$color = _ref4.color,
      color = _ref4$color === void 0 ? 'interactive' : _ref4$color,
      theme = _ref4.theme;
  return theme.onHover(theme[color]);
});

var transparentButton = function transparentButton(defaultColor) {
  return _styled__default["default"](BaseButton).withConfig({
    displayName: "Button__transparentButton",
    componentId: "sc-1soikk5-2"
  })(["color:", ";:enabled:hover{color:", ";}"], function (_ref5) {
    var _ref5$color = _ref5.color,
        color = _ref5$color === void 0 ? defaultColor : _ref5$color,
        theme = _ref5.theme;
    return theme[color];
  }, function (_ref6) {
    var _ref6$color = _ref6.color,
        color = _ref6$color === void 0 ? defaultColor : _ref6$color,
        theme = _ref6.theme;
    return theme.onHover(theme[color]);
  });
};

transparentButton('accent');
var SecondaryButton = transparentButton('secondary');
var IconButton = /*#__PURE__*/React.forwardRef(function IconButton(_ref7, ref) {
  var Icon = _ref7.icon,
      iconProps = _ref7.iconProps,
      props = _objectWithoutProperties__default["default"](_ref7, _excluded$1);

  return /*#__PURE__*/React__default["default"].createElement(SecondaryButton, _extends__default["default"]({}, props, {
    ref: ref
  }), /*#__PURE__*/React__default["default"].createElement(Icon, iconProps));
});

var Column = /*#__PURE__*/_styled__default["default"].div.withConfig({
  displayName: "Column",
  componentId: "sc-1ul9eki-0"
})(["align-items:", ";color:", ";display:", ";flex-direction:column;flex-grow:", ";gap:", ";grid-auto-flow:row;grid-template-columns:1fr;justify-content:", ";padding:", ";", ""], function (_ref) {
  var align = _ref.align;
  return align !== null && align !== void 0 ? align : 'center';
}, function (_ref2) {
  var color = _ref2.color,
      theme = _ref2.theme;
  return color && theme[color];
}, function (_ref3) {
  var flex = _ref3.flex;
  return flex ? 'flex' : 'grid';
}, function (_ref4) {
  var grow = _ref4.grow;
  return grow && 1;
}, function (_ref5) {
  var gap = _ref5.gap;
  return gap && "".concat(gap, "em");
}, function (_ref6) {
  var justify = _ref6.justify;
  return justify !== null && justify !== void 0 ? justify : 'space-between';
}, function (_ref7) {
  var padded = _ref7.padded;
  return padded && '0.75em';
}, function (_ref8) {
  var css = _ref8.css;
  return css;
});

var Row = /*#__PURE__*/_styled__default["default"].div.withConfig({
  displayName: "Row",
  componentId: "sc-1nzvhrh-0"
})(["align-items:", ";color:", ";display:", ";flex-flow:wrap;flex-grow:", ";gap:", ";grid-auto-flow:column;grid-template-columns:", ";justify-content:", ";padding:", ";"], function (_ref) {
  var align = _ref.align;
  return align !== null && align !== void 0 ? align : 'center';
}, function (_ref2) {
  var color = _ref2.color,
      theme = _ref2.theme;
  return color && theme[color];
}, function (_ref3) {
  var flex = _ref3.flex;
  return flex ? 'flex' : 'grid';
}, function (_ref4) {
  var grow = _ref4.grow;
  return grow && 1;
}, function (_ref5) {
  var gap = _ref5.gap;
  return gap && "".concat(gap, "em");
}, function (_ref6) {
  var grow = _ref6.grow,
      children = _ref6.children;
  if (grow === 'first') return '1fr';
  if (grow === 'last') return "repeat(".concat(React.Children.count(children) - 1, ", auto) 1fr");
  if (grow) return "repeat(".concat(React.Children.count(children), ", 1fr)");
  return undefined;
}, function (_ref7) {
  var justify = _ref7.justify;
  return justify !== null && justify !== void 0 ? justify : 'space-between';
}, function (_ref8) {
  var pad = _ref8.pad;
  return pad && "0 ".concat(pad, "em");
});

var Rule = /*#__PURE__*/_styled__default["default"].hr.withConfig({
  displayName: "Rule",
  componentId: "sc-1568p9j-0"
})(["border:none;border-bottom:1px solid ", ";margin:0 ", ";margin-bottom:", "px;margin-top:", "px;max-width:auto;width:auto;"], function (_ref) {
  var theme = _ref.theme;
  return theme.outline;
}, function (_ref2) {
  var padded = _ref2.padded;
  return padded ? '0.75em' : 0;
}, function (_ref3) {
  var scrollingEdge = _ref3.scrollingEdge;
  return scrollingEdge === 'bottom' ? -1 : 0;
}, function (_ref4) {
  var scrollingEdge = _ref4.scrollingEdge;
  return scrollingEdge !== 'bottom' ? -1 : 0;
});

var Context = /*#__PURE__*/React.createContext({
  element: null,
  active: false,
  setActive: function setActive(active) {
    return undefined;
  }
});
var OnCloseContext = /*#__PURE__*/React.createContext(function () {
  return void 0;
});
var Modal = /*#__PURE__*/_styled__default["default"].div.withConfig({
  displayName: "Dialog__Modal",
  componentId: "sc-c8nkza-0"
})(["background-color:", ";border-radius:", "em;display:flex;flex-direction:column;height:100%;left:0;overflow:hidden;position:absolute;top:0;width:100%;z-index:", ";"], function (_ref3) {
  var color = _ref3.color,
      theme = _ref3.theme;
  return theme[color];
}, function (_ref4) {
  var theme = _ref4.theme;
  return theme.borderRadius * 0.75;
}, Layer.DIALOG);
function Dialog(_ref5) {
  var color = _ref5.color,
      children = _ref5.children,
      _ref5$onClose = _ref5.onClose,
      onClose = _ref5$onClose === void 0 ? function () {
    return void 0;
  } : _ref5$onClose;
  var context = React.useContext(Context);
  React.useEffect(function () {
    context.setActive(true);
    return function () {
      return context.setActive(false);
    };
  }, [context]);
  var modal = React.useRef(null);
  React.useEffect(function () {
    return delayUnmountForAnimation(modal);
  }, []);
  React.useEffect(function () {
    var close = function close(e) {
      return e.key === 'Escape' && (onClose === null || onClose === void 0 ? void 0 : onClose());
    };

    document.addEventListener('keydown', close, true);
    return function () {
      return document.removeEventListener('keydown', close, true);
    };
  }, [onClose]);
  return context.element && /*#__PURE__*/reactDom.createPortal( /*#__PURE__*/React__default["default"].createElement(ThemeProvider, null, /*#__PURE__*/React__default["default"].createElement(OnCloseContext.Provider, {
    value: onClose
  }, /*#__PURE__*/React__default["default"].createElement(Modal, {
    color: color,
    ref: modal
  }, children))), context.element);
}

var _templateObject, _templateObject2;

var StyledButton = /*#__PURE__*/_styled__default["default"](Button).withConfig({
  displayName: "ActionButton__StyledButton",
  componentId: "sc-xgl46p-0"
})(["border-radius:", "em;flex-grow:1;transition:background-color 0.25s ease-out,border-radius 0.25s ease-out,flex-grow 0.25s ease-out;:disabled{margin:-1px;}"], function (_ref) {
  var theme = _ref.theme;
  return theme.borderRadius * 0.75;
});

var ActionRow = /*#__PURE__*/_styled__default["default"](Row).withConfig({
  displayName: "ActionButton__ActionRow",
  componentId: "sc-xgl46p-1"
})([""]);

var grow = _styled.keyframes(_templateObject || (_templateObject = _taggedTemplateLiteral__default["default"](["\n  from {\n    opacity: 0;\n    width: 0;\n  }\n  to {\n    opacity: 1;\n    width: max-content;\n  }\n"])));

var actionCss = _styled.css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral__default["default"](["\n  border: 1px solid ", ";\n  padding: calc(0.25em - 1px);\n  padding-left: calc(0.75em - 1px);\n\n  ", " {\n    animation: ", " 0.25s ease-in;\n    flex-grow: 1;\n    justify-content: flex-start;\n    white-space: nowrap;\n  }\n\n  ", " {\n    border-radius: ", "em;\n    flex-grow: 0;\n    padding: 1em;\n  }\n"])), function (_ref2) {
  var theme = _ref2.theme;
  return theme.outline;
}, ActionRow, grow, StyledButton, function (_ref3) {
  var theme = _ref3.theme;
  return theme.borderRadius;
});

var Overlay = /*#__PURE__*/_styled__default["default"](Row).withConfig({
  displayName: "ActionButton__Overlay",
  componentId: "sc-xgl46p-2"
})(["border-radius:", "em;flex-direction:row-reverse;min-height:3.5em;transition:padding 0.25s ease-out;", ""], function (_ref4) {
  var theme = _ref4.theme;
  return theme.borderRadius;
}, function (_ref5) {
  var hasAction = _ref5.hasAction;
  return hasAction && actionCss;
});
function ActionButton(_ref6) {
  var _ref6$color = _ref6.color,
      color = _ref6$color === void 0 ? 'accent' : _ref6$color,
      disabled = _ref6.disabled,
      action = _ref6.action,
      onClick = _ref6.onClick,
      children = _ref6.children;
  var textColor = React.useMemo(function () {
    return color === 'accent' ? 'onAccent' : 'currentColor';
  }, [color]);
  return /*#__PURE__*/React__default["default"].createElement(Overlay, {
    hasAction: Boolean(action),
    flex: true,
    align: "stretch"
  }, (action ? action.onClick : true) && /*#__PURE__*/React__default["default"].createElement(StyledButton, {
    color: color,
    disabled: disabled,
    onClick: (action === null || action === void 0 ? void 0 : action.onClick) || onClick
  }, /*#__PURE__*/React__default["default"].createElement(TransitionButton, {
    buttonSize: action ? 'medium' : 'large',
    color: textColor
  }, (action === null || action === void 0 ? void 0 : action.children) || children)), action && /*#__PURE__*/React__default["default"].createElement(ActionRow, {
    gap: 0.5
  }, /*#__PURE__*/React__default["default"].createElement(LargeIcon, {
    color: "currentColor",
    icon: action.icon || AlertTriangle
  }), /*#__PURE__*/React__default["default"].createElement(Subhead2, null, action === null || action === void 0 ? void 0 : action.message)));
}

var overflowCss = /*#__PURE__*/_styled.css(["overflow-y:scroll;"]);
/** Customizes the scrollbar for vertical overflow. */


var scrollbarCss = function scrollbarCss(padded) {
  return _styled.css(["overflow-y:scroll;::-webkit-scrollbar{width:1.25em;}::-webkit-scrollbar-thumb{background:radial-gradient( closest-corner at 0.25em 0.25em,", " 0.25em,transparent 0.25em ),linear-gradient( to bottom,#ffffff00 0.25em,", " 0.25em,", " calc(100% - 0.25em),#ffffff00 calc(100% - 0.25em) ),radial-gradient( closest-corner at 0.25em calc(100% - 0.25em),", " 0.25em,#ffffff00 0.25em );background-clip:padding-box;border:none;", ":0.75em solid transparent;}@supports not selector(::-webkit-scrollbar-thumb){scrollbar-color:", " transparent;}"], function (_ref) {
    var theme = _ref.theme;
    return theme.interactive;
  }, function (_ref2) {
    var theme = _ref2.theme;
    return theme.interactive;
  }, function (_ref3) {
    var theme = _ref3.theme;
    return theme.interactive;
  }, function (_ref4) {
    var theme = _ref4.theme;
    return theme.interactive;
  }, padded ? 'border-right' : 'border-left', function (_ref5) {
    var theme = _ref5.theme;
    return theme.interactive;
  });
};

function useScrollbar(element) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$padded = _ref6.padded,
      padded = _ref6$padded === void 0 ? false : _ref6$padded;

  return React.useMemo( // NB: The css must be applied on an element's first render. WebKit will not re-apply overflow
  // properties until any transitions have ended, so waiting a frame for state would cause jank.
  function () {
    return hasOverflow(element) ? scrollbarCss(padded) : overflowCss;
  }, [element, padded]);

  function hasOverflow(element) {
    if (!element) return true;
    return element.scrollHeight > element.clientHeight;
  }
}

var HeaderColumn = /*#__PURE__*/_styled__default["default"](Column).withConfig({
  displayName: "Expando__HeaderColumn",
  componentId: "sc-yzkwmi-0"
})(["transition:gap 0.25s;"]);

var ExpandoColumn = /*#__PURE__*/_styled__default["default"](Column).withConfig({
  displayName: "Expando__ExpandoColumn",
  componentId: "sc-yzkwmi-1"
})(["height:", "em;overflow:hidden;position:relative;transition:height 0.25s,padding 0.25s;:after{background:linear-gradient(transparent,", ");bottom:0;content:'';height:0.75em;pointer-events:none;position:absolute;width:calc(100% - 1em);}"], function (_ref) {
  var height = _ref.height,
      open = _ref.open;
  return open ? height : 0;
}, function (_ref2) {
  var theme = _ref2.theme;
  return theme.dialog;
});

var InnerColumn = /*#__PURE__*/_styled__default["default"](Column).withConfig({
  displayName: "Expando__InnerColumn",
  componentId: "sc-yzkwmi-2"
})(["height:", "em;padding:0.5em 0;"], function (_ref3) {
  var height = _ref3.height;
  return height;
});

var _StyledInnerColumn = /*#__PURE__*/_styled__default["default"](InnerColumn).withConfig({
  displayName: "Expando___StyledInnerColumn",
  componentId: "sc-yzkwmi-3"
})(["", ""], function (p) {
  return p.$_css;
});

/** A scrollable Expando with an absolute height. */
function Expando(_ref4) {
  var title = _ref4.title,
      open = _ref4.open,
      onExpand = _ref4.onExpand,
      height = _ref4.height,
      children = _ref4.children;

  var _useState = React.useState(null),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      scrollingEl = _useState2[0],
      setScrollingEl = _useState2[1];

  var scrollbar = useScrollbar(scrollingEl);
  return /*#__PURE__*/React__default["default"].createElement(Column, null, /*#__PURE__*/React__default["default"].createElement(HeaderColumn, {
    gap: open ? 0.5 : 0.75
  }, /*#__PURE__*/React__default["default"].createElement(Rule, null), /*#__PURE__*/React__default["default"].createElement(Row, null, title, /*#__PURE__*/React__default["default"].createElement(IconButton, {
    color: "secondary",
    onClick: onExpand,
    icon: Expando$1,
    iconProps: {
      open: open
    }
  })), /*#__PURE__*/React__default["default"].createElement(Rule, null)), /*#__PURE__*/React__default["default"].createElement(ExpandoColumn, {
    open: open,
    height: height
  }, /*#__PURE__*/React__default["default"].createElement(_StyledInnerColumn, {
    flex: true,
    align: "stretch",
    height: height,
    ref: setScrollingEl,
    $_css: scrollbar
  }, children)));
}

var HeaderIcon = /*#__PURE__*/_styled__default["default"](LargeIcon).withConfig({
  displayName: "ErrorDialog__HeaderIcon",
  componentId: "sc-1yuufry-0"
})(["flex-grow:1;transition:height 0.25s,width 0.25s;svg{transition:height 0.25s,width 0.25s;}"]);

function StatusHeader(_ref) {
  var Icon = _ref.icon,
      iconColor = _ref.iconColor,
      _ref$iconSize = _ref.iconSize,
      iconSize = _ref$iconSize === void 0 ? 4 : _ref$iconSize,
      children = _ref.children;
  return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, /*#__PURE__*/React__default["default"].createElement(Column, {
    flex: true,
    style: {
      flexGrow: 1
    }
  }, /*#__PURE__*/React__default["default"].createElement(HeaderIcon, {
    icon: Icon,
    color: iconColor,
    size: iconSize
  }), /*#__PURE__*/React__default["default"].createElement(Column, {
    gap: 0.75,
    flex: true,
    style: {
      textAlign: 'center'
    }
  }, children)));
}

var ErrorHeader = /*#__PURE__*/_styled__default["default"](Column).withConfig({
  displayName: "ErrorDialog__ErrorHeader",
  componentId: "sc-1yuufry-1"
})(["transition:gap 0.25s;div:last-child{max-height:", "em;overflow-y:hidden;transition:max-height 0.25s;}"], function (_ref2) {
  var open = _ref2.open;
  return open ? 0 : 60 / 14;
});

function ErrorDialog(_ref3) {
  var header = _ref3.header,
      error = _ref3.error,
      action = _ref3.action,
      onClick = _ref3.onClick;

  var _useState = React.useState(false),
      _useState2 = _slicedToArray__default["default"](_useState, 2),
      open = _useState2[0],
      setOpen = _useState2[1];

  var onExpand = React.useCallback(function () {
    return setOpen(function (open) {
      return !open;
    });
  }, []);
  return /*#__PURE__*/React__default["default"].createElement(Column, {
    flex: true,
    padded: true,
    gap: 0.75,
    align: "stretch",
    style: {
      height: '100%'
    }
  }, /*#__PURE__*/React__default["default"].createElement(StatusHeader, {
    icon: AlertTriangle,
    iconColor: "error",
    iconSize: open ? 3 : 4
  }, /*#__PURE__*/React__default["default"].createElement(ErrorHeader, {
    gap: open ? 0 : 0.75,
    open: open
  }, /*#__PURE__*/React__default["default"].createElement(Subhead1, null, /*#__PURE__*/React__default["default"].createElement(Trans, {
    id: "Something went wrong."
  })), /*#__PURE__*/React__default["default"].createElement(Body2, null, header))), /*#__PURE__*/React__default["default"].createElement(Column, {
    gap: open ? 0 : 0.75,
    style: {
      transition: 'gap 0.25s'
    }
  }, /*#__PURE__*/React__default["default"].createElement(Expando, {
    title: /*#__PURE__*/React__default["default"].createElement(Trans, {
      id: "Error details"
    }),
    open: open,
    onExpand: onExpand,
    height: 7.5
  }, /*#__PURE__*/React__default["default"].createElement(Code, {
    userSelect: true
  }, error.name, error.message ? ": ".concat(error.message) : '')), /*#__PURE__*/React__default["default"].createElement(ActionButton, {
    onClick: onClick
  }, action)));
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf__default["default"](Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf__default["default"](this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn__default["default"](this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ErrorBoundary = /*#__PURE__*/function (_Component) {
  _inherits__default["default"](ErrorBoundary, _Component);

  var _super = _createSuper(ErrorBoundary);

  function ErrorBoundary(props) {
    var _this;

    _classCallCheck__default["default"](this, ErrorBoundary);

    _this = _super.call(this, props);
    _this.state = {
      error: null
    };
    return _this;
  }

  _createClass__default["default"](ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, errorInfo) {
      var _this$props$onError, _this$props;

      (_this$props$onError = (_this$props = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props, error, errorInfo);
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.error) {
        return /*#__PURE__*/React__default["default"].createElement(Dialog, {
          color: "dialog"
        }, /*#__PURE__*/React__default["default"].createElement(ErrorDialog, {
          error: this.state.error,
          header: /*#__PURE__*/React__default["default"].createElement(Trans, {
            id: "Something went wrong."
          }),
          action: /*#__PURE__*/React__default["default"].createElement(Trans, {
            id: "Reload the page"
          }),
          onClick: function onClick() {
            return window.location.reload();
          }
        }));
      }

      return this.props.children;
    }
  }], [{
    key: "getDerivedStateFromError",
    value: function getDerivedStateFromError(error) {
      return {
        error: error
      };
    }
  }]);

  return ErrorBoundary;
}(React.Component);

// const getCustomProvider = () => {
//   const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/14c73ecdbcaa464585aa7c438fdf6a77')
//   const jsonRpcEndpoint = 'https://rinkeby.infura.io/v3/14c73ecdbcaa464585aa7c438fdf6a77'
//   return { provider, jsonRpcEndpoint }
// }
function Wrapper(props) {
  var children = props.children,
      provider = props.provider,
      jsonRpcEndpoint = props.jsonRpcEndpoint,
      accounts = props.accounts,
      onError = props.onError;
  return /*#__PURE__*/React__default["default"].createElement(React.StrictMode, null, /*#__PURE__*/React__default["default"].createElement(ErrorBoundary, {
    onError: onError
  }, /*#__PURE__*/React__default["default"].createElement(reactRedux.Provider, {
    store: store
  }, /*#__PURE__*/React__default["default"].createElement(jotai.Provider, null, /*#__PURE__*/React__default["default"].createElement(ActiveWeb3Provider, {
    provider: provider,
    jsonRpcEndpoint: jsonRpcEndpoint,
    accounts: accounts
  }, /*#__PURE__*/React__default["default"].createElement(BlockNumberProvider, null, /*#__PURE__*/React__default["default"].createElement(MulticallUpdater, null), /*#__PURE__*/React__default["default"].createElement(TransactionsUpdater, null), /*#__PURE__*/React__default["default"].createElement(TokenListProvider, {
    list: props.tokenList
  }, children)))))));
}

var SUPPORTED_LOCALES = [// order as they appear in the language dropdown
'en-US', 'af-ZA', 'ar-SA', 'ca-ES', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'es-ES', 'fi-FI', 'fr-FR', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'ko-KR', 'nl-NL', 'no-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sr-SP', 'sv-SE', 'sw-TZ', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'];
var DEFAULT_LOCALE = 'en-US';

var _excluded = ["children"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var reducer = function reducer(state, action) {
  var _action$uniswap, _action$uniswap2, _action$uniswap3;

  switch (action.type) {
    case 'setUniswapValues':
      return _objectSpread(_objectSpread({}, state), {}, {
        uniswap: _objectSpread(_objectSpread({}, action === null || action === void 0 ? void 0 : action.uniswap), {}, {
          values: (_action$uniswap = action.uniswap) === null || _action$uniswap === void 0 ? void 0 : _action$uniswap.values
        })
      });

    case 'setUniswapInput':
      return _objectSpread(_objectSpread({}, state), {}, {
        uniswap: _objectSpread(_objectSpread({}, action === null || action === void 0 ? void 0 : action.uniswap), {}, {
          input: (_action$uniswap2 = action.uniswap) === null || _action$uniswap2 === void 0 ? void 0 : _action$uniswap2.input
        })
      });

    case 'setUniswapOutput':
      return _objectSpread(_objectSpread({}, state), {}, {
        uniswap: _objectSpread(_objectSpread({}, action === null || action === void 0 ? void 0 : action.uniswap), {}, {
          output: (_action$uniswap3 = action.uniswap) === null || _action$uniswap3 === void 0 ? void 0 : _action$uniswap3.output
        })
      });

    default:
      return state;
  }
};

var DispatchSwapValues = /*#__PURE__*/React__default["default"].createContext(undefined);
var initValues = {
  uniswap: {}
};
var SwapValuesContext = /*#__PURE__*/React__default["default"].createContext(initValues);
var SwapValuesProvider = function SwapValuesProvider(props) {
  var _useReducer = React.useReducer(reducer, initValues),
      _useReducer2 = _slicedToArray__default["default"](_useReducer, 2),
      values = _useReducer2[0],
      dispatchSwapValues = _useReducer2[1];

  var children = props.children,
      rest = _objectWithoutProperties__default["default"](props, _excluded);

  return /*#__PURE__*/React__default["default"].createElement(SwapValuesContext.Provider, {
    value: values
  }, /*#__PURE__*/React__default["default"].createElement(DispatchSwapValues.Provider, {
    value: dispatchSwapValues
  }, /*#__PURE__*/React__default["default"].createElement(Wrapper, rest, /*#__PURE__*/React__default["default"].createElement(Swap, rest, children))));
};
var useDispatchSwapValues = function useDispatchSwapValues() {
  var context = React__default["default"].useContext(DispatchSwapValues);

  if (context === undefined) {
    throw new Error('useOnChainContract context is missing');
  }

  return context;
};
function useSwapValues() {
  return React.useContext(SwapValuesContext);
}

exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
exports.SUPPORTED_LOCALES = SUPPORTED_LOCALES;
exports.SwapValuesProvider = SwapValuesProvider;
exports.darkTheme = darkTheme;
exports.defaultTheme = defaultTheme;
exports.lightTheme = lightTheme;
exports.useDispatchSwapValues = useDispatchSwapValues;
exports.useSwapValues = useSwapValues;
