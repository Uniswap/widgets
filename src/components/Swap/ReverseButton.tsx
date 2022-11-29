import { useSwapInfo, useSwitchSwapCurrencies } from 'hooks/swap'
import { ArrowDown, LargeIcon } from 'icons'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'
import { Layer } from 'theme'

import Button from '../Button'

const StyledReverseButton = styled(Button)`
  align-items: center;
  background-color: ${({ theme }) => theme.interactive};
  border: 4px solid;
  border-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius}em;
  display: flex;
  height: 48px;
  justify-content: center;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -60%);
  transition: 125ms ease background-color;
  width: 48px;
  z-index: ${Layer.OVERLAY};
  :hover {
    background-color: ${({ theme }) => transparentize(0.2, theme.module)};
  }
`

export default function ReverseButton() {
  const { error } = useSwapInfo()
  const isDisabled = error !== undefined
  const switchCurrencies = useSwitchSwapCurrencies()

  return (
    <StyledReverseButton disabled={isDisabled} onClick={switchCurrencies}>
      <LargeIcon icon={ArrowDown} />
    </StyledReverseButton>
  )
}
