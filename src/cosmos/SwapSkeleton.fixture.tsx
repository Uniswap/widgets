import { darkTheme, defaultTheme, lightTheme, SwapWidgetSkeleton } from '@uniswap/widgets'
import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'

function Fixture() {
  const [width] = useValue('width', { defaultValue: WIDGET_BREAKPOINTS.EXTRA_SMALL })
  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  return <SwapWidgetSkeleton theme={theme} width={width} />
}

export default <Fixture />
