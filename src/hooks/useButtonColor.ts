import { useTheme } from 'styled-components/macro'

export default function useButtonColor() {
  const { tokenColorExtraction } = useTheme()
  return tokenColorExtraction ? 'interactive' : 'accent'
}
