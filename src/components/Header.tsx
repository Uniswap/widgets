import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import { largeIconCss } from 'icons'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { onConnectWalletClickAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Wallet from './ConnectWallet'
import Row from './Row'
import Settings from './Swap/Settings'

const HeaderRow = styled(Row)`
  height: 1.75em;
  margin: 0 0.75em 0.75em;
  padding-top: 0.5em;
  ${largeIconCss}
`

export interface HeaderProps {
  title?: string
  hideConnectionUI?: boolean
  onConnectWalletClick?: () => void | Promise<boolean>
}

export default function Header(props: HeaderProps) {
  const { isActive } = useWeb3React()
  const onSupportedNetwork = useOnSupportedNetwork()
  const isDisabled = !(isActive && onSupportedNetwork)

  const [onConnectWalletClick, setOnConnectWalletClick] = useAtom(onConnectWalletClickAtom)
  useEffect(() => {
    if (props.onConnectWalletClick !== onConnectWalletClick) {
      setOnConnectWalletClick((old: (() => void | Promise<boolean>) | undefined) => (old = props.onConnectWalletClick))
    }
  }, [props.onConnectWalletClick, onConnectWalletClick, setOnConnectWalletClick])

  return (
    <HeaderRow iconSize={1.2}>
      <Row gap={0.5}>
        {props.title && (
          <ThemedText.Subhead1>
            <Trans>{props.title}</Trans>
          </ThemedText.Subhead1>
        )}
      </Row>
      <Row gap={1}>
        <Wallet disabled={props.hideConnectionUI} />
        <Settings disabled={isDisabled} />
      </Row>
    </HeaderRow>
  )
}
