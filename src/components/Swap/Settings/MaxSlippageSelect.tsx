import { Trans } from '@lingui/macro'
import Popover from 'components/Popover'
import { useTooltip } from 'components/Tooltip'
import { getSlippageWarning, toPercent } from 'hooks/useSlippage'
import { AlertTriangle, Check, Icon, LargeIcon, XOctagon } from 'icons'
import { useAtom } from 'jotai'
import { forwardRef, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { autoSlippageAtom, maxSlippageAtom } from 'state/settings'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { BaseButton, TextButton } from '../../Button'
import Column from '../../Column'
import { DecimalInput, inputCss } from '../../Input'
import Row from '../../Row'
import { Label, optionCss } from './components'

const Button = styled(TextButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
`

const Custom = styled(BaseButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
  ${inputCss}
  padding: calc(0.75em - 3px) 0.625em;
`

interface OptionProps {
  wrapper: typeof Button | typeof Custom
  selected: boolean
  onSelect: () => void
  'data-testid': string
  icon?: ReactNode
  tabIndex?: number
  children: ReactNode
}

const Option = forwardRef<HTMLButtonElement, OptionProps>(function Option(
  { wrapper: Wrapper, children, selected, onSelect, icon, tabIndex, 'data-testid': testid }: OptionProps,
  ref
) {
  return (
    <Wrapper selected={selected} onClick={onSelect} ref={ref} tabIndex={tabIndex} data-testid={testid}>
      <Row gap={0.5}>
        {children}
        {icon ? icon : <LargeIcon icon={selected ? Check : undefined} size={1.25} />}
      </Row>
    </Wrapper>
  )
})

const Warning = memo(function Warning({ state, showTooltip }: { state?: 'warning' | 'error'; showTooltip: boolean }) {
  let icon: Icon | undefined
  let content: ReactNode
  let show = showTooltip
  switch (state) {
    case 'error':
      icon = XOctagon
      content = <Trans>Please enter a valid slippage %</Trans>
      show = true
      break
    case 'warning':
      icon = AlertTriangle
      content = <Trans>High slippage increases the risk of price movement</Trans>
      break
  }
  return (
    <Popover
      key={state}
      content={<ThemedText.Caption>{content}</ThemedText.Caption>}
      show={show}
      placement="top"
      offset={16}
      contained
    >
      <LargeIcon icon={icon} color={state} size={1.25} />
    </Popover>
  )
})

export default function MaxSlippageSelect() {
  const [autoSlippage, setAutoSlippage] = useAtom(autoSlippageAtom)
  const [maxSlippage, setMaxSlippage] = useAtom(maxSlippageAtom)
  const [maxSlippageInput, setMaxSlippageInput] = useState(maxSlippage?.toString() || '')

  const option = useRef<HTMLButtonElement>(null)
  const showTooltip = useTooltip(option.current)

  const input = useRef<HTMLInputElement>(null)
  const focus = useCallback(() => input.current?.focus(), [input])

  const [warning, setWarning] = useState<'warning' | 'error' | undefined>(getSlippageWarning(toPercent(maxSlippage)))
  useEffect(() => {
    setMaxSlippageInput(maxSlippage?.toString() || '')
    setWarning(getSlippageWarning(toPercent(maxSlippage)))
  }, [maxSlippage])

  const onInputSelect = useCallback(() => {
    focus()
    const percent = toPercent(maxSlippage)
    const warning = getSlippageWarning(percent)
    setAutoSlippage(!percent || warning === 'error')
  }, [focus, maxSlippage, setAutoSlippage])

  const processInput = useCallback(
    (input: string | undefined) => {
      setMaxSlippageInput(input || '')
      const value = input ? +input : undefined
      const percent = toPercent(value)
      const warning = getSlippageWarning(percent)
      setMaxSlippage(value)
      setAutoSlippage(!percent || warning === 'error')
    },
    [setAutoSlippage, setMaxSlippage]
  )

  return (
    <Column gap={0.75}>
      <Label
        name={<Trans>Max slippage</Trans>}
        tooltip={
          <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
        }
      />
      <Row gap={0.5} grow="last">
        <Option wrapper={Button} selected={autoSlippage} onSelect={() => setAutoSlippage(true)} data-testid="auto">
          <ThemedText.ButtonMedium>
            <Trans>Auto</Trans>
          </ThemedText.ButtonMedium>
        </Option>
        <Option
          wrapper={Custom}
          selected={!autoSlippage}
          onSelect={onInputSelect}
          icon={warning && <Warning state={warning} showTooltip={showTooltip} />}
          ref={option}
          tabIndex={-1}
          data-testid="custom"
        >
          <Row color={warning === 'error' ? 'error' : undefined}>
            <DecimalInput
              size={Math.max(maxSlippageInput.length, 4)}
              value={maxSlippageInput}
              onChange={(input) => processInput(input)}
              placeholder={'0.10'}
              ref={input}
              data-testid="input"
            />
            %
          </Row>
        </Option>
      </Row>
    </Column>
  )
}
