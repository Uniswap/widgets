import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { render } from 'test'
import { Provider as ThemeProvider } from 'theme'

import { useIsDialogPageCentered } from './Dialog'
import { ResponsiveDialog } from './ResponsiveDialog'

jest.mock('hooks/useIsMobileWidth')
jest.mock('./Dialog')

const mockUseIsMobileWidth = useIsMobileWidth as jest.Mock
const mockUseIsDialogPageCentered = useIsDialogPageCentered as jest.Mock

describe('ResponsiveDialog', () => {
  beforeEach(() => {
    mockUseIsMobileWidth.mockReturnValue(false)
    mockUseIsDialogPageCentered.mockReturnValue(false)
  })

  it('renders a dialog by default (nothing rendered when closed)', () => {
    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={false} setOpen={() => null}>
          <div>dialog content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.queryByText('dialog content')).toBeNull()
  })

  it('renders a popover when defaultView is set to popover', () => {
    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={true} setOpen={() => null} defaultView="popover">
          <div>popover content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.getByTestId('popover-container')).toBeTruthy()
  })

  it('renders a bottom sheet when on mobile and pageCenteredDialogsEnabled is true', () => {
    mockUseIsMobileWidth.mockReturnValue(true)
    mockUseIsDialogPageCentered.mockReturnValue(true)

    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={true} setOpen={() => null}>
          <div>bottom sheet content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.getByTestId('BottomSheetModal__Wrapper')).toBeTruthy()
  })

  it('renders a bottom sheet when on mobile and mobileBottomSheet is true', () => {
    mockUseIsMobileWidth.mockReturnValue(true)

    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={true} setOpen={() => null} mobileBottomSheet={true}>
          <div>bottom sheet content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.getByTestId('BottomSheetModal__Wrapper')).toBeTruthy()
  })

  it('renders a popover when on mobile and defaultView is set to popover', () => {
    mockUseIsMobileWidth.mockReturnValue(true)

    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={true} setOpen={() => null} defaultView="popover">
          <div>popover content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.getByTestId('popover-container')).toBeTruthy()
  })

  it('renders an anchor when provided', () => {
    const view = render(
      <ThemeProvider>
        <ResponsiveDialog open={true} setOpen={() => null} anchor={<div>anchor</div>}>
          <div>dialog content</div>
        </ResponsiveDialog>
      </ThemeProvider>
    )

    expect(view.getByText('anchor')).toBeTruthy()
  })
})
