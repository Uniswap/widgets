/// <reference types="react" />
import react, { ErrorInfo } from 'react';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenInfo } from '@uniswap/token-lists';
export { TokenInfo } from '@uniswap/token-lists';
import { Provider } from '@web3-react/types';
export { Provider as Eip1193Provider } from '@web3-react/types';
export { Provider as EthersProvider } from '@ethersproject/abstract-provider';

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

interface SwapToken {
    address: string;
    decimals: number;
}
interface SwapField {
    amount?: string;
    currency?: SwapToken;
}
interface SwapProps extends TokenDefaults, FeeOptions {
    chainId: number;
    children: JSX.Element | JSX.Element[] | null;
}

declare type ErrorHandler = (error: Error, info: ErrorInfo) => void;

declare type WrapperProps = {
    accounts: string[];
    provider?: Provider | JsonRpcProvider;
    jsonRpcEndpoint?: string | JsonRpcProvider;
    tokenList?: string | TokenInfo[];
    onError?: ErrorHandler;
};

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

declare const SUPPORTED_LOCALES: string[];
declare type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';
declare const DEFAULT_LOCALE: SupportedLocale;

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

interface Values {
    uniswap: {
        values?: any;
        input?: SwapField;
        output?: SwapField;
    };
}
interface Action extends Values {
    type: 'setUniswapValues' | 'setUniswapInput' | 'setUniswapOutput';
}
declare type Dispatch = react.Dispatch<Values>;
declare type SwapWidgetProps = SwapProps & WrapperProps & {
    children?: JSX.Element | JSX.Element[] | null;
};
declare const SwapValuesProvider: (props: SwapWidgetProps) => JSX.Element;
declare const useDispatchSwapValues: () => (a: Action) => void;
declare function useSwapValues(): Values;

export { DEFAULT_LOCALE, DefaultAddress, Dispatch, ErrorHandler, FeeOptions, SUPPORTED_LOCALES, SupportedChainId, SupportedLocale, SwapValuesProvider, SwapWidgetProps, Theme, TokenDefaults, Values, darkTheme, defaultTheme, lightTheme, useDispatchSwapValues, useSwapValues };
