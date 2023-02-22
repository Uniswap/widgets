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
 *
 * If the animation should be applied to an element that is not the root node of the removed subtree,
 * pass that element as the animatedElement parameter.
 */
export function useUnmountingAnimation(
  node: RefObject<HTMLElement>,
  getAnimatingClass: () => string,
  animatedElement?: RefObject<HTMLElement>,
  skip = false
) {
  useEffect(() => {
    const current = node.current
    const animated = animatedElement?.current ?? current
    const parent = current?.parentElement
    const removeChild = parent?.removeChild
    if (!(parent && removeChild) || skip) return

    parent.removeChild = function <T extends Node>(child: T) {
      if ((child as Node) === current && animated) {
        animated.classList.add(getAnimatingClass())
        if (isAnimating(animated)) {
          animated.addEventListener('animationend', () => {
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
  }, [animatedElement, getAnimatingClass, node, skip])
}
