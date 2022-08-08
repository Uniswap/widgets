import { IntegrationError } from 'errors'
import { DefaultAddress } from 'hooks/swap/useSyncTokenDefaults'
import { useAtomValue } from 'jotai/utils'
import { PropsWithChildren, useEffect } from 'react'
import { isControlledSwapStateAtom } from 'state/swap'
import { isAddress } from 'utils'

import { SwapProps } from '.'

function isAddressOrAddressMap(addressOrMap: DefaultAddress): boolean {
  if (typeof addressOrMap === 'object') {
    return Object.values(addressOrMap).every((address) => isAddress(address))
  }
  if (typeof addressOrMap === 'string') {
    return typeof isAddress(addressOrMap) === 'string'
  }
  return false
}

type ValidatorProps = PropsWithChildren<SwapProps>

export default function useValidate(props: ValidatorProps) {
  const { convenienceFee, convenienceFeeRecipient } = props
  useEffect(() => {
    if (convenienceFee) {
      if (convenienceFee > 100 || convenienceFee < 0) {
        throw new IntegrationError(`convenienceFee must be between 0 and 100 (you set it to ${convenienceFee}).`)
      }
      if (!convenienceFeeRecipient) {
        throw new IntegrationError('convenienceFeeRecipient is required when convenienceFee is set.')
      }

      if (typeof convenienceFeeRecipient === 'string') {
        if (!isAddress(convenienceFeeRecipient)) {
          throw new IntegrationError(
            `convenienceFeeRecipient must be a valid address (you set it to ${convenienceFeeRecipient}).`
          )
        }
      } else if (typeof convenienceFeeRecipient === 'object') {
        Object.values(convenienceFeeRecipient).forEach((recipient) => {
          if (!isAddress(recipient)) {
            const values = Object.values(convenienceFeeRecipient).join(', ')
            throw new IntegrationError(
              `All values in convenienceFeeRecipient object must be valid addresses (you used ${values}).`
            )
          }
        })
      }
    }
  }, [convenienceFee, convenienceFeeRecipient])

  const {
    inputToken,
    inputTokenOnChange,
    outputToken,
    outputTokenOnChange,
    amount,
    amountOnChange,
    independentField,
    independentFieldOnChange,
    defaultTokenSelectorDisabled, // not related to controllability of swap state
    defaultInputAmount,
    defaultOutputAmount,
    defaultInputTokenAddress,
    defaultOutputTokenAddress,
  } = props
  const { isControlledAmount, isControlledToken } = useAtomValue(isControlledSwapStateAtom)
  useEffect(() => {
    const uncontrolledStateProps = {
      defaultInputAmount,
      defaultOutputAmount,
      defaultInputTokenAddress,
      defaultOutputTokenAddress,
    }
    let uncontrolledPropCount = 0
    Object.keys(uncontrolledStateProps).forEach((key) => {
      if (uncontrolledStateProps[key as keyof typeof uncontrolledStateProps] !== undefined) uncontrolledPropCount++
    })
    if (isControlledToken && (defaultInputTokenAddress || defaultOutputTokenAddress)) {
      throw new IntegrationError('Controlled & uncontrolled token props may not both be defined.')
    }
    if (isControlledAmount && (defaultInputAmount || defaultOutputAmount)) {
      throw new IntegrationError('Controlled & uncontrolled token amount props may not both be defined.')
    }
  }, [
    isControlledAmount,
    isControlledToken,
    defaultInputAmount,
    defaultInputTokenAddress,
    defaultOutputAmount,
    defaultOutputTokenAddress,
  ])

  useEffect(() => {
    if (defaultOutputAmount && defaultInputAmount) {
      throw new IntegrationError('defaultInputAmount and defaultOutputAmount may not both be defined.')
    }
    if (defaultInputAmount && (isNaN(+defaultInputAmount) || defaultInputAmount < 0)) {
      throw new IntegrationError(`defaultInputAmount must be a positive number (you set it to ${defaultInputAmount})`)
    }
    if (defaultOutputAmount && (isNaN(+defaultOutputAmount) || defaultOutputAmount < 0)) {
      throw new IntegrationError(
        `defaultOutputAmount must be a positive number (you set it to ${defaultOutputAmount}).`
      )
    }
  }, [defaultInputAmount, defaultOutputAmount])

  useEffect(() => {
    if (
      defaultInputTokenAddress &&
      !isAddressOrAddressMap(defaultInputTokenAddress) &&
      defaultInputTokenAddress !== 'NATIVE'
    ) {
      throw new IntegrationError(
        `defaultInputTokenAddress must be a valid address or "NATIVE" (you set it to ${defaultInputTokenAddress}).`
      )
    }
    if (
      defaultOutputTokenAddress &&
      !isAddressOrAddressMap(defaultOutputTokenAddress) &&
      defaultOutputTokenAddress !== 'NATIVE'
    ) {
      throw new IntegrationError(
        `defaultOutputTokenAddress must be a valid address or "NATIVE" (you set it to ${defaultOutputTokenAddress}).`
      )
    }
  }, [defaultInputTokenAddress, defaultOutputTokenAddress])

  useEffect(() => {
    if (isControlledAmount) {
      if (amount && !amountOnChange) {
        throw new IntegrationError(`If amount is controlled, you must provide both amount and amountOnChange.`)
      }
      if (amount && (isNaN(+amount) || amount < 0)) {
        throw new IntegrationError(`Token amount must be a positive number (you set it to ${amount})`)
      }
    }
  }, [isControlledAmount, amount, amountOnChange])

  useEffect(() => {
    if (inputToken && outputToken) {
      if (inputToken === outputToken) {
        throw new IntegrationError('inputToken and outputToken may not be the same token.')
      }
      if (inputToken.chainId !== outputToken.chainId) {
        throw new IntegrationError(
          `ChainIds for inputToken (${inputToken.chainId})) and outputToken (${outputToken.chainId})) must be the same.`
        )
      }
    }
    if (
      inputToken &&
      !inputToken.isNative &&
      inputToken.isToken &&
      inputToken.address &&
      !isAddressOrAddressMap(inputToken.address)
    ) {
      // fixme: do we only check for valid address? what else do we check for a valid token input?
      throw new IntegrationError(`inputToken must be a valid token or "NATIVE" (you set it to ${inputToken.address}).`)
    }
    if (
      outputToken &&
      !outputToken.isNative &&
      outputToken.isToken &&
      outputToken.address &&
      !isAddressOrAddressMap(outputToken.address)
    ) {
      throw new IntegrationError(
        `defaultInputTokenAddress must be a valid address or "NATIVE" (you set it to ${outputToken.address}).`
      )
    }
  }, [inputToken, outputToken])

  useEffect(() => {
    if (isControlledToken) {
      const allTokenOnChangeProps = Boolean(inputTokenOnChange) && Boolean(outputTokenOnChange)
      const anyTokenOnChangeProps = Boolean(inputTokenOnChange || outputTokenOnChange)
      if (defaultTokenSelectorDisabled) {
        if (anyTokenOnChangeProps) {
          throw new IntegrationError(
            'If using controlled token state & default token selector is disabled, you must provide inputToken and outputToken, and should not provide inputTokenOnChange nor outputTokenOnChange.'
          )
        }
      } else {
        if (!allTokenOnChangeProps) {
          throw new IntegrationError(
            'If using controlled token state & default token selector is enabled, you must provide inputToken, outputToken, inputTokenOnChange, and outputTokenOnChange.'
          )
        }
      }
    }
  }, [
    inputToken,
    inputTokenOnChange,
    outputToken,
    outputTokenOnChange,
    defaultTokenSelectorDisabled,
    isControlledToken,
  ])
}
