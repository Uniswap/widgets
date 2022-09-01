import ActionButton from 'components/ActionButton'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  return <ActionButton color={color}></ActionButton>
}
