/// <reference types="react" />
import { TradeType, Currency, Percent, CurrencyAmount, Token } from '@uniswap/sdk-core';
export { Currency, TradeType } from '@uniswap/sdk-core';
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers';
export { JsonRpcProvider } from '@ethersproject/providers';
import { Trade } from '@uniswap/router-sdk';
import { ChainId } from '@uniswap/smart-order-router';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
export { Provider as EthersProvider } from '@ethersproject/abstract-provider';
import { TokenInfo, TokenList } from '@uniswap/token-lists';
export { TokenInfo } from '@uniswap/token-lists';
import react, { ErrorInfo } from 'react';
import { Provider } from '@web3-react/types';
export { Provider as Eip1193Provider } from '@web3-react/types';

declare enum RouterPreference {
    API = "api",
    CLIENT = "client"
}
declare enum QuoteType {
    TRADE = "trade",
    PRICE = "price",
    SKIP = "skip"
}

interface GetQuoteArgs {
    tokenInAddress: string;
    tokenInChainId: ChainId;
    tokenInDecimals: number;
    tokenInSymbol?: string;
    tokenOutAddress: string;
    tokenOutChainId: ChainId;
    tokenOutDecimals: number;
    tokenOutSymbol?: string;
    amount: string | null;
    routerPreference: RouterPreference;
    routerUrl?: string;
    tradeType: TradeType;
    provider: BaseProvider;
    quoteType: QuoteType;
    onQuote?: OnSwapQuote;
}
declare enum QuoteState {
    SUCCESS = "Success",
    INITIALIZED = "Initialized",
    NOT_FOUND = "Not found"
}
declare type TradeResult = {
    state: QuoteState.INITIALIZED | QuoteState.NOT_FOUND;
    trade?: undefined;
    gasUseEstimateUSD?: undefined;
    blockNumber?: undefined;
} | {
    state: QuoteState.SUCCESS;
    trade: InterfaceTrade;
    gasUseEstimateUSD: string;
    blockNumber: string;
};
declare class InterfaceTrade extends Trade<Currency, Currency, TradeType> {
}

interface WidgetErrorConfig {
    header?: string;
    action?: string;
    message?: string;
    error?: unknown;
}
declare class WidgetError extends Error {
    header: string;
    action: string;
    /** The original error, if this is a wrapped error. */
    error: unknown;
    dismissable: boolean;
    constructor(config: WidgetErrorConfig);
}
declare class UnknownError extends WidgetError {
    constructor(config: WidgetErrorConfig);
}
/**
 * A Promise which rejects with a known WidgetError.
 * Although it is well-typed, this typing only works when using the Promise as a Thennable, not through async/await.
 * @example widgetPromise.catch((reason: WidgetError) => console.error(reason.error))
 */
declare class WidgetPromise<V, R extends WidgetError = WidgetError> extends Promise<V> {
    static from<P extends {
        then(onfulfilled: (value: any) => any): any;
        catch(onrejected: (reason: any) => any): any;
    }, V extends Parameters<Parameters<P['then']>[0]>[0], R extends Parameters<Parameters<P['catch']>[0]>[0], WidgetValue = V, WidgetReason extends WidgetError = WidgetError>(value: P | (() => P), 
    /** Synchronously maps the value to the WidgetPromise value. Any thrown reason must be mappable by onrejected. */
    onfulfilled: ((value: V) => WidgetValue) | null, 
    /**
     * Synchronously maps the reason to the WidgetPromise reason. Must throw the mapped reason.
     * @throws {@link WidgetReason}
     */
    onrejected: (reason: R) => never): WidgetPromise<WidgetValue, WidgetReason & UnknownError>;
    catch<T = never>(onrejected?: ((reason: R) => T | Promise<T>) | undefined | null): Promise<V | T>;
}
/** Dismissable errors are not be considered fatal by the ErrorBoundary. */
declare class DismissableError extends WidgetError {
    constructor(config: WidgetErrorConfig);
}
declare class UserRejectedRequestError extends DismissableError {
    constructor();
}

declare enum TransactionType {
    APPROVAL = 0,
    SWAP = 1,
    WRAP = 2,
    UNWRAP = 3
}
interface BaseTransactionInfo {
    type: TransactionType;
    response: TransactionResponse;
}
interface ApprovalTransactionInfo extends BaseTransactionInfo {
    type: TransactionType.APPROVAL;
    tokenAddress: string;
    spenderAddress: string;
}
interface SwapTransactionInfo extends BaseTransactionInfo {
    type: TransactionType.SWAP;
    tradeType: TradeType;
    trade: InterfaceTrade;
    slippageTolerance: Percent;
}
interface ExactInputSwapTransactionInfo extends SwapTransactionInfo {
    tradeType: TradeType.EXACT_INPUT;
}
interface ExactOutputSwapTransactionInfo extends SwapTransactionInfo {
    tradeType: TradeType.EXACT_OUTPUT;
}
interface WrapTransactionInfo extends BaseTransactionInfo {
    type: TransactionType.WRAP;
    amount: CurrencyAmount<Currency>;
}
interface UnwrapTransactionInfo extends BaseTransactionInfo {
    type: TransactionType.UNWRAP;
    amount: CurrencyAmount<Currency>;
}
declare type TransactionInfo = ApprovalTransactionInfo | SwapTransactionInfo | WrapTransactionInfo | UnwrapTransactionInfo;
interface Transaction<T extends TransactionInfo = TransactionInfo> {
    addedTime: number;
    lastCheckedBlockNumber?: number;
    receipt?: TransactionReceipt;
    info: T;
}

/**
 * An integration hook called when a new quote is fetched.
 * @param quote resolves with the quote when it is available.
 */
declare type OnSwapQuote = (args: Omit<GetQuoteArgs, 'provider' | 'onQuote'>, quote: WidgetPromise<TradeResult>) => void;
/**
 * An integration hook called when requesting a token allowance from the user.
 * NB: You may instrument the time-to-confirmation by calling transaction.response.wait().
 * @param transaction resolves with the approval transaction info when it is granted.
 */
declare type OnTokenAllowance = (args: {
    token: Token;
    spender: string;
}, transaction: WidgetPromise<ApprovalTransactionInfo>) => void;
/**
 * An integration hook called when requesting a Permit2 token allowance from the user.
 * @param signed resolves when the permit is signed.
 */
declare type OnPermit2Allowance = (args: {
    token: Token;
    spender: string;
}, signed: WidgetPromise<void>) => void;
/**
 * An integration hook called when sending a swap transaction to the mempool through the user.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the swap transaction info when it is sent to the mempool.
 */
declare type OnSwapSend = (args: {
    trade: InterfaceTrade;
}, transaction: WidgetPromise<SwapTransactionInfo>) => void;
/**
 * An integration hook called when sending a swap transaction to the mempool through the user.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the swap transaction info when it is sent to the mempool.
 */
declare type OnWrapSend = (args: {
    amount: CurrencyAmount<Currency>;
}, transaction: WidgetPromise<WrapTransactionInfo | UnwrapTransactionInfo>) => void;
interface PerfEventHandlers {
    onSwapQuote?: OnSwapQuote;
    onTokenAllowance?: OnTokenAllowance;
    onPermit2Allowance?: OnPermit2Allowance;
    onSwapSend?: OnSwapSend;
    onWrapSend?: OnWrapSend;
}

interface Slippage {
    auto: boolean;
    max: string | undefined;
}
interface Settings {
    slippage: Slippage;
    transactionTtl: number | undefined;
    routerPreference: RouterPreference;
}
/** An integration hook called when the user resets settings. */
declare type OnSettingsReset = () => void;
/** An integration hook called when the user changes slippage settings. */
declare type OnSlippageChange = (slippage: Slippage) => void;
/** An integration hook called when the user changes transaction deadline settings. */
declare type OnTransactionDeadlineChange = (ttl: number | undefined) => void;
declare type OnRouterPreferenceChange = (routerPreference: RouterPreference) => void;
interface SettingsEventHandlers {
    onSettingsReset?: OnSettingsReset;
    onSlippageChange?: OnSlippageChange;
    onTransactionDeadlineChange?: OnTransactionDeadlineChange;
    onRouterPreferenceChange?: OnRouterPreferenceChange;
}

declare enum Field {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT"
}
interface Swap {
    type: TradeType;
    amount: string;
    [Field.INPUT]?: Currency;
    [Field.OUTPUT]?: Currency;
}
/** An integration hook called when the user selects a new token. */
declare type OnTokenChange = (field: Field, token: Currency) => void;
/**
 * An integration hook called when the user enters a new amount.
 * If the amount changed from the user clicking Max, origin will be set to 'max'.
 */
declare type OnAmountChange = (field: Field, amount: string, origin?: 'max') => void;
/** An integration hook called when the user switches the tokens. */
declare type OnSwitchTokens = () => void;
/**
 * An integration hook called when the user clicks the token selector.
 * If the hook resolve to false or rejects, the token selector will not open.
 */
declare type OnTokenSelectorClick = (field: Field) => void | boolean | Promise<boolean>;
/** An integration hook called when the user expands a swap's details. */
declare type OnExpandSwapDetails = () => void;
/**
 * An integration hook called when the user clicks 'Review swap'.
 * If the hook resolves to false or rejects, the review dialog will not open.
 */
declare type OnReviewSwapClick = () => void | boolean | Promise<boolean>;
interface InputEventHandlers {
    onTokenChange?: OnTokenChange;
    onAmountChange?: OnAmountChange;
    onSwitchTokens?: OnSwitchTokens;
    onTokenSelectorClick?: OnTokenSelectorClick;
    onExpandSwapDetails?: OnExpandSwapDetails;
    onReviewSwapClick?: OnReviewSwapClick;
}
/** An integration hook called when the user receives an initial quote for a set of inputs. */
declare type OnInitialSwapQuote = (trade: InterfaceTrade) => void;
/** An integration hook called when the user acks a quote's price update. */
declare type OnSwapPriceUpdateAck = (stale: InterfaceTrade, update: InterfaceTrade) => void;
/** An integration hook called when the user approves a token, either through allowance or permit. */
declare type OnSwapApprove = () => void;
/** An integration hook called when the confirms a swap, but before it is submitted. */
declare type OnSubmitSwapClick = (trade: InterfaceTrade) => void;
interface SwapEventHandlers extends SettingsEventHandlers, InputEventHandlers, PerfEventHandlers {
    onInitialSwapQuote?: OnInitialSwapQuote;
    onSwapPriceUpdateAck?: OnSwapPriceUpdateAck;
    /** @deprecated Use {@link onTokenAllowance} and {@link onPermit2Allowance} instead. */
    onSwapApprove?: OnSwapApprove;
    /** @deprecated Use {@link onSwapSend} instead. */
    onSubmitSwapClick?: OnSubmitSwapClick;
}

interface SwapController {
    value?: Swap;
    settings?: Settings;
}

interface FeeOptions {
    convenienceFee?: number;
    convenienceFeeRecipient?: string | string | {
        [chainId: number]: string;
    };
}

/**
 * List of all the networks supported by the Uniswap Interface
 */
declare enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    ARBITRUM_ONE = 42161,
    ARBITRUM_RINKEBY = 421611,
    OPTIMISM = 10,
    OPTIMISM_GOERLI = 420,
    POLYGON = 137,
    POLYGON_MUMBAI = 80001,
    CELO = 42220,
    CELO_ALFAJORES = 44787,
    BNB = 56
}

declare type DefaultAddress = string | {
    [chainId: number]: string | 'NATIVE';
} | 'NATIVE';
interface TokenDefaults {
    defaultInputTokenAddress?: DefaultAddress;
    defaultInputAmount?: number | string;
    defaultOutputTokenAddress?: DefaultAddress;
    defaultOutputAmount?: number | string;
    defaultChainId?: SupportedChainId;
}

interface SwapProps extends FeeOptions, SwapController, SwapEventHandlers, TokenDefaults {
    hideConnectionUI?: boolean;
    routerUrl?: string;
}

declare enum Layer {
    UNDERLAYER = -1,
    OVERLAY = 100,
    DIALOG = 1000,
    TOOLTIP = 2000
}

interface Colors {
    accent: string;
    accentSoft: string;
    container: string;
    module: string;
    interactive: string;
    outline: string;
    dialog: string;
    scrim: string;
    primary: string;
    onAccent: string;
    secondary: string;
    hint: string;
    onInteractive: string;
    active: string;
    activeSoft: string;
    success: string;
    warning: string;
    warningSoft: string;
    error: string;
    critical: string;
    criticalSoft: string;
    networkDefaultShadow: string;
    deepShadow: string;
    currentColor: 'currentColor';
}
declare type ThemeBorderRadius = {
    large: number;
    medium: number;
    small: number;
    xsmall: number;
};
declare type ZIndex = {
    modal: number;
};
interface Attributes {
    borderRadius: ThemeBorderRadius;
    zIndex: ZIndex;
    fontFamily: string | {
        font: string;
        variable: string;
    };
    fontFamilyCode: string;
    tokenColorExtraction: boolean;
}
interface Theme extends Partial<Attributes>, Partial<Colors> {
}

declare const lightTheme: Colors;
declare const darkTheme: Colors;
declare const defaultTheme: {
    accent: string;
    accentSoft: string;
    container: string;
    module: string;
    interactive: string;
    outline: string;
    dialog: string;
    scrim: string;
    primary: string;
    onAccent: string;
    secondary: string;
    hint: string;
    onInteractive: string;
    active: string;
    activeSoft: string;
    success: string;
    warning: string;
    warningSoft: string;
    error: string;
    critical: string;
    criticalSoft: string;
    networkDefaultShadow: string;
    deepShadow: string;
    currentColor: "currentColor";
    borderRadius: {
        large: number;
        medium: number;
        small: number;
        xsmall: number;
    };
    zIndex: {
        modal: Layer;
    };
    fontFamily: {
        font: string;
        variable: string;
    };
    fontFamilyCode: string;
    tokenColorExtraction: boolean;
};

declare global {
    interface HTMLElement {
        inert: boolean;
    }
}
interface DialogOptions {
    animationType?: DialogAnimationType;
    pageCentered?: boolean;
}
interface DialogWidgetProps {
    dialog?: HTMLDivElement | null;
    dialogOptions?: DialogOptions;
}
declare enum DialogAnimationType {
    SLIDE = "slide",
    FADE = "fade",
    NONE = "none"
}

declare type OnError = (error: Error, info?: ErrorInfo) => void;

declare const SUPPORTED_LOCALES: string[];
declare type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';
declare const DEFAULT_LOCALE: SupportedLocale;

declare type OnTxSubmit = (hash: string, tx: Transaction) => void;
declare type OnTxSuccess = (hash: string, tx: WithRequired<Transaction, 'receipt'>) => void;
declare type OnTxFail = (hash: string, receipt: TransactionReceipt) => void;
interface TransactionEventHandlers {
    onTxSubmit?: OnTxSubmit;
    onTxSuccess?: OnTxSuccess;
    onTxFail?: OnTxFail;
}

interface Flags {
    brandedFooter?: boolean;
    permit2?: boolean;
}

/** Defined by EIP-3085. */
interface AddEthereumChainParameter {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: 18;
    };
    blockExplorerUrls: [string];
    rpcUrls: string[];
}
/**
 * An integration hook called when the user tries to switch chains.
 * If the hook returns a Promise, it is assumed the integrator is attempting to switch the chain, and no further attempts will be made.
 * If that Promise rejects, the error will be ignored so as not to crash the widget.
 */
declare type OnSwitchChain = (addChainParameter: AddEthereumChainParameter) => void | Promise<void>;

declare type OnConnectWalletClick = () => void | boolean | Promise<boolean>;

interface WidgetEventHandlers {
    onConnectWalletClick?: OnConnectWalletClick;
    onError?: OnError;
    onSwitchChain?: OnSwitchChain;
}

declare type JsonRpcConnectionMap = {
    [chainId: number]: string | string[] | JsonRpcProvider | JsonRpcProvider[];
};

interface ProviderProps {
    defaultChainId?: SupportedChainId;
    jsonRpcUrlMap?: JsonRpcConnectionMap;
    /**
     * If null, no auto-connection (MetaMask or WalletConnect) will be attempted.
     * This is appropriate for integrations which wish to control the connected provider.
     */
    provider?: Provider | JsonRpcProvider | null;
}

interface WidgetProps extends Flags, TransactionEventHandlers, ProviderProps, WidgetEventHandlers, DialogWidgetProps {
    theme?: Theme;
    locale?: SupportedLocale;
    tokenList?: string | TokenInfo[];
    width?: string | number;
    className?: string;
    onError?: OnError;
}

declare type LogoTableInput = {
    address?: string | null;
    chainId: number;
    isNative?: boolean;
    logoURI?: string;
};

/** An optional component to update table with logos as sources change */
declare function LogoUpdater({ assets }: {
    assets: LogoTableInput[];
}): null;
declare function useLogos(currency: LogoTableInput | undefined): string[] | undefined;
declare function useLogo(currency: LogoTableInput | undefined): {
    src: string | undefined;
    invalidateSrc: () => void;
};

declare function getAssetsRepoURI(asset: LogoTableInput): string | undefined;
declare function getNativeLogoURI(chainId?: SupportedChainId): string;

declare type LogoBasePops = {
    symbol?: string | null;
    backupImg?: string | null;
    size?: string;
    style?: react.CSSProperties;
};
/**
 * Renders an image by prioritizing a list of sources, and then eventually a fallback triangle alert
 */
declare type LogoProps = {
    currency: LogoTableInput;
} & LogoBasePops;
declare function Logo({ currency, symbol, backupImg, size, style, ...rest }: LogoProps): JSX.Element;

interface SwapWidgetSkeletonProps {
    theme?: Theme;
    width?: string | number;
}
declare function SwapWidgetSkeleton({ theme, width }: SwapWidgetSkeletonProps): JSX.Element;

declare const UNISWAP_TOKEN_LIST = "https://gateway.ipfs.io/ipns/tokens.uniswap.org";
declare const EMPTY_TOKEN_LIST: never[];

/**
 * Validates an array of tokens.
 * @param json the TokenInfo[] to validate
 */
declare function validateTokens(json: TokenInfo[]): Promise<TokenInfo[]>;
/**
 * Validates a token list.
 * @param json the TokenList to validate
 */
declare function validateTokenList(json: TokenList): Promise<TokenList>;

declare function invertTradeType(tradeType: TradeType): TradeType;
declare function toTradeType(modifiedField: Field): TradeType;

declare type SwapWidgetProps = SwapProps & WidgetProps;
declare function SwapWidget(props: SwapWidgetProps): JSX.Element;

export { AddEthereumChainParameter, ApprovalTransactionInfo, DEFAULT_LOCALE, DefaultAddress, DialogAnimationType, DialogOptions, DialogWidgetProps, EMPTY_TOKEN_LIST, ExactInputSwapTransactionInfo, ExactOutputSwapTransactionInfo, FeeOptions, Field, Flags, JsonRpcConnectionMap, Logo, LogoUpdater, OnAmountChange, OnConnectWalletClick, OnError, OnExpandSwapDetails, OnInitialSwapQuote, OnPermit2Allowance, OnReviewSwapClick, OnRouterPreferenceChange, OnSettingsReset, OnSlippageChange, OnSubmitSwapClick, OnSwapApprove, OnSwapPriceUpdateAck, OnSwapQuote, OnSwapSend, OnSwitchChain, OnSwitchTokens, OnTokenAllowance, OnTokenChange, OnTokenSelectorClick, OnTransactionDeadlineChange, OnTxFail, OnTxSubmit, OnTxSuccess, OnWrapSend, RouterPreference, SUPPORTED_LOCALES, Slippage, SupportedChainId, SupportedLocale, SwapController, SwapEventHandlers, PerfEventHandlers as SwapPerfEventHandlers, SettingsEventHandlers as SwapSettingsEventHandlers, SwapTransactionInfo, SwapWidget, SwapWidgetProps, SwapWidgetSkeleton, SwapWidgetSkeletonProps, Theme, TokenDefaults, Transaction, TransactionEventHandlers, TransactionInfo, TransactionType, UNISWAP_TOKEN_LIST, UnknownError, UnwrapTransactionInfo, UserRejectedRequestError, WidgetError, WidgetEventHandlers, WidgetPromise, WrapTransactionInfo, darkTheme, defaultTheme, getAssetsRepoURI, getNativeLogoURI, invertTradeType, lightTheme, toTradeType, useLogo, useLogos, validateTokenList, validateTokens };
