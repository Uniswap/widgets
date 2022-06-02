import { useSelect } from 'react-cosmos/fixture'

export const NONE = 'None'

export default function useOption<T extends string>(
  label: string,
  {
    options,
    defaultValue,
    nullable,
  }: {
    options: T[]
    defaultValue?: T
    nullable?: boolean
  }
): T | undefined
export default function useOption<T>(
  label: string,
  {
    options,
    defaultValue,
    nullable,
  }: {
    options: Record<string, T>
    defaultValue?: string
    nullable?: boolean
  }
): T | undefined
export default function useOption<T>(
  label: string,
  {
    options,
    defaultValue = NONE,
    nullable = true,
  }: {
    options: string[] | Record<string, T>
    defaultValue?: string
    nullable?: boolean
  }
): T | undefined {
  if (!nullable && defaultValue === NONE) {
    throw new Error('Non-nullable options must specify a defaultValue')
  }

  const isArray = Array.isArray(options)
  const keys = isArray ? options : Object.keys(options)
  const labels = nullable ? [NONE, ...keys] : keys

  const [key] = useSelect(label, { options: labels, defaultValue })
  return (key === NONE ? undefined : isArray ? key : options[key]) as T
}
