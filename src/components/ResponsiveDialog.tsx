import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { useOutsideClickHandler } from 'hooks/useOutsideClickHandler'
import { Info } from 'icons'
import { PropsWithChildren, useState } from 'react'

import { BottomSheetModal } from './BottomSheetModal'
import { IconButton } from './Button'
import Dialog, { useIsDialogPageCentered } from './Dialog'
import Popover, { PopoverBoundaryProvider } from './Popover'

interface ResponsiveDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  // when not on a mobile width, use the default view.
  defaultView?: 'dialog' | 'popover'
  // an anchor view to render when the dialog is closed. Useful as an entry point to a bottom sheet or popover.
  // if not provided, a default info icon will be used.
  anchor?: React.ReactNode
  // If true, always render the dialog as a bottom sheet on mobile.
  // If false, it will only be a bottom sheet if it was page-centered.
  mobileBottomSheet?: boolean
  bottomSheetTitle?: string
}

/**
 * A Dialog or Popover that renders as a bottom sheet on mobile.
 */
export function ResponsiveDialog({
  children,
  open,
  setOpen,
  defaultView = 'dialog',
  anchor,
  mobileBottomSheet,
  bottomSheetTitle,
}: PropsWithChildren<ResponsiveDialogProps>) {
  const isMobile = useIsMobileWidth()
  const pageCenteredDialogsEnabled = useIsDialogPageCentered()
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)
  useOutsideClickHandler(isMobile ? null : wrapper, () => setOpen(false))

  if (isMobile && (pageCenteredDialogsEnabled || mobileBottomSheet)) {
    return (
      <>
        {anchor}
        <BottomSheetModal onClose={() => setOpen(false)} open={open} title={bottomSheetTitle}>
          {children}
        </BottomSheetModal>
      </>
    )
  } else if (defaultView === 'popover') {
    return (
      <div ref={setWrapper}>
        <PopoverBoundaryProvider value={wrapper}>
          <Popover showArrow={false} offset={10} show={open} placement="top-end" content={children}>
            {anchor ?? <IconButton icon={Info} />}
          </Popover>
        </PopoverBoundaryProvider>
      </div>
    )
  } else {
    return (
      <>
        {anchor}
        {open && (
          <Dialog color="container" onClose={() => setOpen(false)}>
            {children}
          </Dialog>
        )}
      </>
    )
  }
}
