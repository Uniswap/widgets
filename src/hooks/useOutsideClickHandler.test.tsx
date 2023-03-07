import { fireEvent, render, renderHook, RenderResult } from 'test'

import { useOutsideClickHandler } from './useOutsideClickHandler'

describe('useOutsideClickHandler', () => {
  let node: RenderResult<typeof import('@testing-library/dom/types/queries'), HTMLElement, HTMLElement>
  const onOutsideClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    node = render(<div />)
    renderHook(() => useOutsideClickHandler(node.container as HTMLDivElement, onOutsideClick))
  })

  it('should call onOutsideClick when clicked outside of node', () => {
    fireEvent.mouseDown(document.body)
    expect(onOutsideClick).toHaveBeenCalled()
  })

  it('should not call onOutsideClick when clicked inside of node', () => {
    fireEvent.mouseDown(node.container)
    expect(onOutsideClick).not.toHaveBeenCalled()
  })
})
