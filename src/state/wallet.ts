import { atom } from 'jotai'

export type OnConnectWalletClick = () => void | boolean | Promise<boolean>

// If set, allows integrator to add behavior when 'Connect wallet to swap' button is clicked
export const onConnectWalletClickAtom = atom<OnConnectWalletClick | undefined>(undefined)
