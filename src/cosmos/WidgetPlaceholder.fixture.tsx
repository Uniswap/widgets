import { useEffect } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { darkTheme, defaultTheme, lightTheme, WidoWidgetPlaceholder } from 'wido-widget'

function Fixture() {
  const [width] = useValue('width', { defaultValue: 360 })
  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  return <WidoWidgetPlaceholder theme={theme} width={width} />
}

export default <Fixture />
