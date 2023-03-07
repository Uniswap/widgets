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
 * pass that element in the animatedElements array.
 *
 * Using the animatedElements array, you can apply exit animations to multiple elements at once.
 * Currently this only supports using the same className for all the elements, and uses
 * the animation of the first element in the array to determine when to unmount the node.
 */
export function useUnmountingAnimation(
  node: RefObject<HTMLElement>,
  getAnimatingClass: () => string,
  animatedElements?: RefObject<HTMLElement>[],
  skip = false
) {
  useEffect(() => {
    const current = node.current
    const animated = animatedElements?.map((element) => element.current) ?? [current]
    const parent = current?.parentElement
    const removeChild = parent?.removeChild
    if (!(parent && removeChild) || skip) return

    parent.removeChild = function <T extends Node>(child: T) {
      if ((child as Node) === current && animated) {
        animated.forEach((element) => element?.classList.add(getAnimatingClass()))
        const animating = animated.find((element) => isAnimating(element ?? undefined))
        if (animating) {
          animating?.addEventListener('animationend', (x) => {
            // This check is needed because the animationend event will fire for all animations on the
            // element or its children.
            if (x.target === animating) {
              removeChild.call(parent, child)
            }
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
  }, [animatedElements, getAnimatingClass, node, skip])
}
