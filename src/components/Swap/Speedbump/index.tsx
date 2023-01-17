import { t, Trans } from '@lingui/macro'
import Column from 'components/Column'
import { StatusHeader } from 'components/Error/ErrorDialog'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle, LargeIcon, X } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Body = styled(Column)`
  height: calc(100% - 2.5em);
`
const SpeedbumpWrapper = styled.div`
  padding: 1.75em 1.25em;
`

interface SpeedbumpDialogProps {
  impact: PriceImpact
  onContinue: () => void
  onClose: () => void
}

export function SpeedbumpDialog({ impact, onContinue, onClose }: SpeedbumpDialogProps) {
  return (
    <SpeedbumpWrapper>
      <div onClick={onClose}>
        <LargeIcon icon={X} color="primary" />
      </div>

      <Body flex align="stretch" padded gap={0.75}>
        <StatusHeader icon={AlertTriangle} iconColor="critical" iconSize={4}>
          <Column>
            <ThemedText.H3>
              <Trans>Warning</Trans>
            </ThemedText.H3>
            <ThemedText.Body1>
              {t`This transaction will result in a ${impact?.toString()} price impact on the market price of this pool. Do you wish to continue? `}
            </ThemedText.Body1>
          </Column>
        </StatusHeader>
        {/* <Heading gap={0.75} flex justify="center">
          <Summary
            input={inputAmount}
            output={outputAmount}
            inputUSDC={inputUSDC}
            outputUSDC={outputUSDC}
            impact={impact}
            open={open}
          />
          <Price trade={trade} />
        </Heading>
        <Expando
          title={<Subhead impact={impact} slippage={slippage} />}
          open={open}
          onExpand={onExpand}
          height={6}
          gap={open ? 0 : 0.75}
        >
          <Column gap={0.5}>
            <Details trade={trade} slippage={slippage} gasUseEstimateUSD={gasUseEstimateUSD} impact={impact} />
            <Estimate trade={trade} slippage={slippage} />
          </Column>
        </Expando> */}

        {/* <ConfirmButton trade={trade} highPriceImpact={impact?.warning === 'error'} onConfirm={onConfirm} /> */}
      </Body>
    </SpeedbumpWrapper>
  )
}
