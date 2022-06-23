/// <reference types="react" />
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenInfo } from '@uniswap/token-lists';
export { TokenInfo } from '@uniswap/token-lists';
import { Provider } from '@web3-react/types';
export { Provider as Eip1193Provider } from '@web3-react/types';
import { Currency, TradeType, CurrencyAmount, Token, Percent } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/router-sdk';
import { Route } from '@uniswap/v2-sdk';
import { Route as Route$1 } from '@uniswap/v3-sdk';
import { ErrorInfo } from 'react';
export { Provider as EthersProvider } from '@ethersproject/abstract-provider';

declare const SUPPORTED_LOCALES: string[];
declare type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';
declare const DEFAULT_LOCALE: SupportedLocale;

declare enum TradeState {
    LOADING = 0,
    INVALID = 1,
    NO_ROUTE_FOUND = 2,
    VALID = 3,
    SYNCING = 4
}
declare class InterfaceTrade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> extends Trade<TInput, TOutput, TTradeType> {
    gasUseEstimateUSD: CurrencyAmount<Token> | null | undefined;
    constructor({ gasUseEstimateUSD, ...routes }: {
        gasUseEstimateUSD?: CurrencyAmount<Token> | undefined | null;
        v2Routes: {
            routev2: Route<TInput, TOutput>;
            inputAmount: CurrencyAmount<TInput>;
            outputAmount: CurrencyAmount<TOutput>;
        }[];
        v3Routes: {
            routev3: Route$1<TInput, TOutput>;
            inputAmount: CurrencyAmount<TInput>;
            outputAmount: CurrencyAmount<TOutput>;
        }[];
        tradeType: TTradeType;
    });
}

interface Slippage {
    auto: boolean;
    allowed: Percent;
    warning?: 'warning' | 'error';
}

interface PriceImpact {
    percent: Percent;
    warning?: 'warning' | 'error';
    toString(): string;
}

declare enum Field {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT"
}

interface SwapField {
    currency?: Currency;
    amount?: CurrencyAmount<Currency>;
    balance?: CurrencyAmount<Currency>;
    usdc?: CurrencyAmount<Currency>;
}
interface SwapInfo {
    [Field.INPUT]: SwapField;
    [Field.OUTPUT]: SwapField;
    trade: {
        trade?: InterfaceTrade<Currency, Currency, TradeType>;
        state: TradeState;
    };
    slippage: Slippage;
    impact?: PriceImpact;
}

interface Colors {
    accent: string;
    container: string;
    module: string;
    interactive: string;
    outline: string;
    dialog: string;
    primary: string;
    onAccent: string;
    secondary: string;
    hint: string;
    onInteractive: string;
    active: string;
    success: string;
    warning: string;
    error: string;
    currentColor: 'currentColor';
}
interface Attributes {
    borderRadius: boolean | number;
    fontFamily: string | {
        font: string;
        variable: string;
    };
    fontFamilyCode: string;
    tokenColorExtraction: boolean;
}
interface Theme extends Partial<Attributes>, Partial<Colors> {
}
interface ComputedTheme extends Omit<Attributes, 'borderRadius'>, Colors {
    borderRadius: number;
    onHover: (color: string) => string;
}
declare module 'styled-components/macro' {
    interface DefaultTheme extends ComputedTheme {
    }
}

declare const lightTheme: Colors;
declare const darkTheme: Colors;
declare const defaultTheme: {
    accent: string;
    container: string;
    module: string;
    interactive: string;
    outline: string;
    dialog: string;
    primary: string;
    onAccent: string;
    secondary: string;
    hint: string;
    onInteractive: string;
    active: string;
    success: string;
    warning: string;
    error: string;
    currentColor: "currentColor";
    borderRadius: number;
    fontFamily: {
        font: string;
        variable: string;
    };
    fontFamilyCode: string;
    tokenColorExtraction: boolean;
};

declare type ErrorHandler = (error: Error, info: ErrorInfo) => void;

declare type OnChange = (e: SwapInfo) => void;
declare type WidgetProps = {
    theme?: Theme;
    locale?: SupportedLocale;
    provider?: Provider | JsonRpcProvider;
    jsonRpcEndpoint?: string | JsonRpcProvider;
    tokenList?: string | TokenInfo[];
    width?: string | number;
    dialog?: HTMLElement | null;
    className?: string;
    onError?: ErrorHandler;
    onChange?: OnChange;
};

interface FeeOptions {
    convenienceFee?: number;
    convenienceFeeRecipient?: string | string | {
        [chainId: number]: string;
    };
}

declare type DefaultAddress = string | {
    [chainId: number]: string | 'NATIVE';
} | 'NATIVE';
interface TokenDefaults {
    defaultInputTokenAddress?: DefaultAddress;
    defaultInputAmount?: number | string;
    defaultOutputTokenAddress?: DefaultAddress;
    defaultOutputAmount?: number | string;
}

interface SwapProps extends TokenDefaults, FeeOptions {
    onConnectWallet?: () => void;
    onChange?: OnChange;
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
    OPTIMISTIC_KOVAN = 69,
    POLYGON = 137,
    POLYGON_MUMBAI = 80001
}

declare type SwapWidgetProps = SwapProps & WidgetProps;
declare function SwapWidget(props: SwapWidgetProps): JSX.Element;

export { DEFAULT_LOCALE, DefaultAddress, ErrorHandler, FeeOptions, SUPPORTED_LOCALES, SupportedChainId, SupportedLocale, SwapWidget, SwapWidgetProps, Theme, TokenDefaults, darkTheme, defaultTheme, lightTheme };
