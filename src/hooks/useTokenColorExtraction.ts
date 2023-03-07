import { useTheme } from 'styled-components/macro'

export default function useTokenColorExtraction() {
  const { tokenColorExtraction } = useTheme()
  return tokenColorExtraction ? 'interactive' : 'accent'
}
