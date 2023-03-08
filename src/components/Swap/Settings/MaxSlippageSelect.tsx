import { Trans } from '@lingui/macro'
import Expando, { IconPrefix } from 'components/Expando'
import Popover from 'components/Popover'
import { useTooltip } from 'components/Tooltip'
import { useSwapInfo } from 'hooks/swap'
import { getSlippageWarning, toPercent } from 'hooks/useSlippage'
import { Expando as ExpandoIcon } from 'icons'
import { AlertTriangle, Check, Icon, LargeIcon, XOctagon } from 'icons'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { forwardRef, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { slippageAtom } from 'state/swap/settings'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { BaseButton, IconButton, TextButton } from '../../Button'
import Column from '../../Column'
import { DecimalInput, inputCss } from '../../Input'
import Row from '../../Row'
import { Label, optionCss } from './components'

const Button = styled(TextButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
  display: flex;
  flex-grow: 1;
  max-width: 180px;
`

const Custom = styled(BaseButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
  ${inputCss}
  display: flex;
  flex-grow: 1;
  max-width: 180px;
  * input {
    text-align: right;
  }
`

const ExpandoContentRow = styled(Row)`
  margin: 1rem 0 0;
`

interface OptionProps {
  wrapper: typeof Button | typeof Custom
  selected: boolean
  onSelect: () => void
  'data-testid': string
  justify?: 'flex-end' | 'flex-start'
  icon?: ReactNode
  tabIndex?: number
  children: ReactNode
}

const Option = forwardRef<HTMLButtonElement, OptionProps>(function Option(
  { wrapper: Wrapper, children, selected, onSelect, icon, tabIndex, 'data-testid': testid, justify }: OptionProps,
  ref
) {
  return (
    <Wrapper selected={selected} onClick={onSelect} ref={ref} tabIndex={tabIndex} data-testid={testid}>
      <Row gap={0.5} flex grow flow="nowrap" justify={justify} align="center">
        {children}
        {icon ? icon : <LargeIcon icon={Check} size={1.25} color={selected ? 'active' : 'hint'} />}
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
  const { onSlippageChange } = useAtomValue(swapEventHandlersAtom)
  const [slippage, setSlippageBase] = useAtom(slippageAtom)
  const setSlippage = useCallback(
    (update: typeof slippage) => {
      onSlippageChange?.(update)
      setSlippageBase(update)
    },
    [onSlippageChange, setSlippageBase]
  )
  const setAutoSlippage = useCallback(() => {
    setSlippage({
      auto: true,
      max: undefined,
    })
  }, [setSlippage])
  const [maxSlippageInput, setMaxSlippageInput] = useState(slippage.max?.toString() || '')

  const option = useRef<HTMLButtonElement>(null)
  const showTooltip = useTooltip(option.current)

  const input = useRef<HTMLInputElement>(null)
  const focus = useCallback(() => input.current?.focus(), [input])

  const [warning, setWarning] = useState<'warning' | 'error' | undefined>(getSlippageWarning(toPercent(slippage.max)))
  useEffect(() => {
    setMaxSlippageInput(slippage.max?.toString() || '')
    setWarning(getSlippageWarning(toPercent(slippage.max)))
  }, [slippage.max])

  const onInputSelect = useCallback(() => {
    focus()
    const percent = toPercent(slippage.max)
    const warning = getSlippageWarning(percent)
    const auto = !percent || warning === 'error'
    setSlippage({ ...slippage, auto })
  }, [focus, slippage, setSlippage])

  const processInput = useCallback(
    (max: string | undefined) => {
      setMaxSlippageInput(max || '')
      const percent = toPercent(max)
      const warning = getSlippageWarning(percent)
      const auto = !percent || warning === 'error'
      setSlippage({ auto, max })
    },
    [setSlippage]
  )

  const { slippage: allowedSlippage } = useSwapInfo()

  const [open, setOpen] = useState(false)
  return (
    <Column gap={0.75}>
      <Expando
        title={
          <Row style={{ cursor: 'pointer' }} grow justify="space-between" onClick={() => setOpen((open) => !open)}>
            <Label
              name={<Trans>Max slippage</Trans>}
              tooltip={
                <Trans>
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </Trans>
              }
            />
            <Row gap={0.2} justify="flex-end" flex>
              <IconPrefix>{slippage.auto ? <Trans>Auto</Trans> : `${maxSlippageInput}%`}</IconPrefix>
              <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
            </Row>
          </Row>
        }
        styledWrapper={false}
        maxHeight={5}
        open={open}
        onExpand={() => setOpen(!open)}
      >
        <ExpandoContentRow gap={0.5} grow="first" flex justify="flex-end">
          <Option wrapper={Button} selected={slippage.auto} onSelect={setAutoSlippage} data-testid="auto-slippage">
            <ThemedText.ButtonMedium>
              <Trans>Auto</Trans>
            </ThemedText.ButtonMedium>
          </Option>
          <Option
            wrapper={Custom}
            selected={!slippage.auto}
            onSelect={onInputSelect}
            icon={warning && <Warning state={warning} showTooltip={showTooltip} />}
            ref={option}
            tabIndex={-1}
            justify="flex-end"
            data-testid="custom-slippage"
          >
            <Row color={warning === 'error' ? 'error' : undefined} flex grow flow="nowrap">
              <DecimalInput
                size={Math.max(maxSlippageInput.length, 4)}
                value={maxSlippageInput}
                onChange={(input) => processInput(input)}
                placeholder={allowedSlippage.allowed.toFixed(2)}
                ref={input}
                data-testid="input-slippage"
                maxLength={10}
              />
              %
            </Row>
          </Option>
        </ExpandoContentRow>
      </Expando>
    </Column>
  )
}
