/**
 * End-to-end tests import from pure, a non-act environment which does not run cleanup between tests.
 * Using an act environment would require mocking out all asynchronous calls, which is too arduous.
 *
 * If they require cleanup, they should run it explicitly:
 *
 *     afterEach(cleanup)
 */
import { waitFor as waitForBase, waitForOptions } from '@testing-library/react/pure'
export * from '@testing-library/react/pure'

export function waitFor(callback: () => unknown, options?: Omit<waitForOptions, 'timeout'>) {
  // Increase the default timeout to the default L1 block interval (as tests will fork mainnet).
  return waitForBase(callback, { ...options, timeout: 12000 })
}
