import { useEffect } from 'react'

export function useOutsideClickHandler(node: HTMLDivElement | null, onOutsideClick: () => void) {
  const handleClickOutside = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node)) {
      onOutsideClick()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
}
