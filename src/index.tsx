import React, { useContext, useReducer } from 'react';
import Swap, { SwapField, SwapProps } from 'components/Swap'
import Wrapper, { WrapperProps } from 'components/Wrapper'
export type { Provider as EthersProvider } from '@ethersproject/abstract-provider'
export type { TokenInfo } from '@uniswap/token-lists'
export type { Provider as Eip1193Provider } from '@web3-react/types'
export type { ErrorHandler } from 'components/Error/ErrorBoundary'
export { SupportedChainId } from 'constants/chains'
export type { SupportedLocale } from 'constants/locales'
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'
export type { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
export type { DefaultAddress, TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
export type { Theme } from 'theme'
export { darkTheme, defaultTheme, lightTheme } from 'theme'

export interface Values {
  uniswap: {
    values?: any;
    input?: SwapField;
    output?: SwapField
  }
};
interface Action extends Values {
  type:
  | 'setUniswapValues'
  | 'setUniswapInput'
  | 'setUniswapOutput'

};

export type Dispatch = React.Dispatch<Values>;
const reducer = (state: Values, action: Action) => {
  switch (action.type) {
    case 'setUniswapValues':
      return { ...state, uniswap: { ...action?.uniswap, values: action.uniswap?.values } };

    case 'setUniswapInput':
      return { ...state, uniswap: { ...action?.uniswap, input: action.uniswap?.input } };
    case 'setUniswapOutput':
      return { ...state, uniswap: { ...action?.uniswap, output: action.uniswap?.output } };
    default:
      return state
  }
};

const DispatchSwapValues = React.createContext<((a: Action) => void) | undefined>(
  undefined
);

const initValues = { uniswap: { }}
const SwapValuesContext = React.createContext<Values>(initValues);

export type SwapWidgetProps = SwapProps & WrapperProps & {
  children?: JSX.Element | JSX.Element[] | null;
}

export const SwapValuesProvider = (props: SwapWidgetProps) => {
  const [values, dispatchSwapValues] = useReducer(reducer, initValues);
  const { children, ...rest } = props;
  return (
    <SwapValuesContext.Provider value={values}>
      <DispatchSwapValues.Provider value={dispatchSwapValues}>
        <Wrapper {...rest}>
          <Swap {...rest}>
            {children}
          </Swap>
        </Wrapper></DispatchSwapValues.Provider>
    </SwapValuesContext.Provider>
  );
};

export const useDispatchSwapValues = () => {
  const context = React.useContext(DispatchSwapValues);

  if (context === undefined) {
    throw new Error('useOnChainContract context is missing');
  }

  return context;
};

export function useSwapValues() {
  return useContext(SwapValuesContext);
}
