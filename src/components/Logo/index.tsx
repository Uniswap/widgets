import React from 'react'
import styled from 'styled-components/macro'

import { useLogo } from './hooks'
import { LogoTableInput } from './LogoTable'

export * from './hooks'
export * from './util'

const MissingImageLogo = styled.div<{ size?: string }>`
  --size: ${({ size }) => size ?? '24px'};
  background-color: ${({ theme }) => theme.interactive};
  border-radius: 100px;
  color: ${({ theme }) => theme.primary};
  font-size: calc(var(--size) / 3);
  font-weight: 500;
  height: ${({ size }) => size ?? '24px'};
  line-height: ${({ size }) => size ?? '24px'};
  text-align: center;
  width: ${({ size }) => size ?? '24px'};
`

const LogoImage = styled.img<{ size: string }>`
  background: radial-gradient(white 60%, #ffffff00 calc(70% + 1px));
  border-radius: 50%;
  box-shadow: 0 0 1px white;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`

export type LogoBasePops = {
  symbol?: string | null
  backupImg?: string | null
  size?: string
  style?: React.CSSProperties
}

// TODO(cartcrom): add prop to optionally render an L2Icon w/ the logo
/**
 * Renders an image by prioritizing a list of sources, and then eventually a fallback triangle alert
 */
type LogoProps = { currency: LogoTableInput } & LogoBasePops
export function Logo({ currency, symbol, backupImg, size = '24px', style, ...rest }: LogoProps) {
  const imageProps = {
    alt: `${symbol ?? 'token'} logo`,
    size,
    style,
    ...rest,
  }

  const { src, invalidateSrc } = useLogo(currency)

  if (src) {
    return <LogoImage {...imageProps} src={src} onError={invalidateSrc} />
  } else {
    return (
      <MissingImageLogo size={size}>
        {/* use only first 3 characters of Symbol for design reasons */}
        {symbol?.toUpperCase().replace('$', '').replace(/\s+/g, '').slice(0, 3)}
      </MissingImageLogo>
    )
  }
}
