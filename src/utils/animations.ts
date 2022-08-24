import { RefObject, useEffect } from 'react'

// Some tests will pass undefined for the Document.
export function isAnimating(node?: Animatable | Document) {
  return (node?.getAnimations?.().length ?? 0) > 0
}

/**
 * Delays a node's unmounting until any animations on that node are finished, so that an unmounting
 * animation may be applied. If there is no animation, this is a no-op.
 *
 * CSS should target the class returned from getAnimatingClass to determine when to apply the
 * animation.
 * Note that getAnimatingClass will be called when the node would normally begin unmounting.
 */
export function useUnmountingAnimation(node: RefObject<HTMLElement>, getAnimatingClass: () => string) {
  useEffect(() => {
    const current = node.current
    const parent = current?.parentElement
    const removeChild = parent?.removeChild
    if (!(parent && removeChild)) return

    parent.removeChild = function <T extends Node>(child: T) {
      if ((child as Node) === current) {
        current.classList.add(getAnimatingClass())
        if (isAnimating(current)) {
          current.addEventListener('animationend', () => {
            removeChild.call(parent, child)
          })
        } else {
          removeChild.call(parent, child)
        }
        return child
      } else {
        return removeChild.call(parent, child) as T
      }
    }
    return () => {
      parent.removeChild = removeChild
    }
  }, [getAnimatingClass, node])
}
