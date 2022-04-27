import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { TokenListProvider } from 'hooks/useTokenList'

import { Modal } from './Dialog'
import { TokenSelectDialog } from './TokenSelect'

export default function Fixture() {
  return (
    <Modal color="module">
      <TokenListProvider list={DEFAULT_TOKEN_LIST.tokens}>
        <TokenSelectDialog onSelect={() => void 0} />
      </TokenListProvider>
    </Modal>
  )
}
