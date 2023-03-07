import { useSwapInfo, useSwitchSwapCurrencies } from 'hooks/swap'
import { LargeIcon, Reverse } from 'icons'
import styled from 'styled-components/macro'
import { Layer } from 'theme'

import Button from '../Button'

const Underlayer = styled.div`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius.medium}em;
  height: 48px;
  left: 50%;
  position: absolute;
  /* Adjust by 2px to account for border display. */
  transform: translate(-50%, calc(-50% - 2px));
  width: 48px;
  z-index: ${Layer.OVERLAY};
`

const StyledReverseButton = styled(Button)`
  align-items: center;
  background-color: ${({ theme }) => theme.module};
  border: 4px solid ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  display: flex;
  justify-content: center;
  width: 100%;
`

export default function ReverseButton() {
  const { error } = useSwapInfo()
  const isDisabled = error !== undefined
  const switchCurrencies = useSwitchSwapCurrencies()

  return (
    <Underlayer>
      <StyledReverseButton disabled={isDisabled} onClick={switchCurrencies}>
        <LargeIcon icon={Reverse} />
      </StyledReverseButton>
    </Underlayer>
  )
}
