import { darkTheme, defaultTheme, lightTheme, SwapWidgetSkeleton } from '@uniswap/widgets'
import Row from 'components/Row'
import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'

function Fixture() {
  const [width] = useValue('width', { defaultValue: 360 })

  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])
  const widget = <SwapWidgetSkeleton theme={theme} width={width} />

  // If framed in a different origin, only display the SwapWidget, without any chrome.
  // This is done to faciliate iframing in the documentation (https://docs.uniswap.org).
  if (!window.frameElement) return widget

  return (
    <Row flex align="start" justify="start" gap={0.5}>
      {widget}
    </Row>
  )
}

export default <Fixture />
