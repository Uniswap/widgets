import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'

import CurrencyLogo from './Logo/CurrencyLogo'

interface BaseProps {
  // TODO(1533): Include logoURI as an optional property of Currency.
  token: Currency & { logoURI?: string }
  size?: number
}

type TokenImgProps = BaseProps & Omit<React.ImgHTMLAttributes<HTMLImageElement>, keyof BaseProps>

function TokenImg({ token, size, ...rest }: TokenImgProps) {
  return <CurrencyLogo currency={token} size={(size ?? 1) + 'em'} />
}

export default styled(TokenImg)<{ size?: number }>`
  // radial-gradient calculates distance from the corner, not the edge: divide by sqrt(2)
  background: radial-gradient(
    ${({ theme }) => theme.module} calc(100% / ${Math.sqrt(2)} - 1.5px),
    ${({ theme }) => theme.outline} calc(100% / ${Math.sqrt(2)} - 1.5px)
  );
  border-radius: 100%;
  height: ${({ size }) => size || 1}em;
  width: ${({ size }) => size || 1}em;
`
