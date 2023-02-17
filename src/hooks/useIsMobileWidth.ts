import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT_WIDTH = 640

export function useIsMobileWidth() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const resizeListener = () => setWidth(window.innerWidth)
    window.addEventListener('resize', resizeListener)

    return () => window.removeEventListener('resize', resizeListener)
  }, [])

  return width < MOBILE_BREAKPOINT_WIDTH
}
