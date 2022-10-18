import { Currency } from '@uniswap/sdk-core'
import { useToken } from 'hooks/useCurrency'
import useCurrencyLogoURIs from 'hooks/useCurrencyLogoURIs'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/macro'

const badSrcs = new Set<string>()

const MissingTokenImg = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.container};
  border-radius: 100%;
  display: flex;
  justify-content: center;
`

const MissingTokenSymbol = styled.span<{ size?: number }>`
  color: ${({ theme }) => theme.primary};
  font-size: ${({ size }) => (size || 1) * (7 / 20)}em;
  font-weight: 500;
`

interface BaseProps {
  // TODO(1533): Include logoURI as an optional property of Currency.
  token: Currency & { logoURI?: string }
  size?: number
}

type TokenImgProps = BaseProps & Omit<React.ImgHTMLAttributes<HTMLImageElement>, keyof BaseProps>

function TokenImg({ token, size, ...rest }: TokenImgProps) {
  // Use the wrapped token info so that it includes the logoURI...
  const currency = useToken(token.isToken ? token.wrapped.address : undefined) ?? token
  // ..but use the token directly if logoURI was included in its specification.
  const srcs = useCurrencyLogoURIs(token?.logoURI ? token : currency)
  const alt = currency.name || currency.symbol

  const [attempt, setAttempt] = useState(0)
  const src = useMemo(() => {
    // Trigger a re-render when an error occurs.
    void attempt

    return srcs.find((src) => !badSrcs.has(src))
  }, [attempt, srcs])
  const onError = useCallback(
    (e) => {
      if (src) badSrcs.add(src)
      setAttempt((attempt) => ++attempt)
    },
    [src]
  )

  if (!src) {
    return (
      <MissingTokenImg {...rest}>
        <MissingTokenSymbol size={size}>
          {currency.symbol?.toUpperCase().replace('$', '').replace(/\s+/g, '').slice(0, 3)}
        </MissingTokenSymbol>
      </MissingTokenImg>
    )
  }
  return <img src={src} alt={alt} key={alt} onError={onError} {...rest} />
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
