import { atom } from 'jotai'

// If set, allows integrator to add behavior when 'Connect wallet to swap' button is clicked
export const onConnectWalletClickAtom = atom<(() => void | Promise<boolean>) | undefined>(undefined)
