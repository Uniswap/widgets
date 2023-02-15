import { fireEvent, render, renderHook } from 'test'

import { useOutsideClickHandler } from './useOutsideClickHandler'

describe('useOutsideClickHandler', () => {
  it('should call onOutsideClick when clicked outside of node', () => {
    const onOutsideClick = jest.fn()
    const node = render(<div />)
    renderHook(() => useOutsideClickHandler(node.container as HTMLDivElement, onOutsideClick))
    fireEvent.mouseDown(document.body)
    expect(onOutsideClick).toHaveBeenCalled()
  })

  it('should not call onOutsideClick when clicked inside of node', () => {
    const onOutsideClick = jest.fn()
    const node = render(<div />)
    renderHook(() => useOutsideClickHandler(node.container as HTMLDivElement, onOutsideClick))
    fireEvent.mouseDown(node.container)
    expect(onOutsideClick).not.toHaveBeenCalled()
  })
})
