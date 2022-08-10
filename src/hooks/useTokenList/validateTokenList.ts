import type { TokenInfo, TokenList } from '@uniswap/token-lists'
import type { ValidateFunction } from 'ajv'

enum ValidationSchema {
  LIST = 'list',
  TOKENS = 'tokens',
}

function getValidationErrors(validate: ValidateFunction | undefined): string {
  return (
    validate?.errors?.map((error) => [error.instancePath, error.message].filter(Boolean).join(' ')).join('; ') ??
    'unknown error'
  )
}

async function loadValidator(schema: ValidationSchema): Promise<ValidateFunction> {
  const [, validatorModule] = await Promise.all([
    import('ajv'),
    schema === ValidationSchema.LIST
      ? import('__generated__/validateTokenList')
      : import('__generated__/validateTokens'),
  ])
  return (await validatorModule.default) as ValidateFunction
}

/**
 * Validates an array of tokens.
 * @param json the TokenInfo[] to validate
 */
export async function validateTokens(json: TokenInfo[]): Promise<TokenInfo[]> {
  const validate = await loadValidator(ValidationSchema.TOKENS)
  if (validate?.({ tokens: json })) {
    return json
  }
  throw new Error(`Token list failed validation: ${getValidationErrors(validate)}`)
}

/**
 * Validates a token list.
 * @param json the TokenList to validate
 */
export default async function validateTokenList(json: TokenList): Promise<TokenList> {
  const validate = await loadValidator(ValidationSchema.LIST)
  if (validate?.(json)) {
    return json
  }
  throw new Error(`Token list failed validation: ${getValidationErrors(validate)}`)
}
