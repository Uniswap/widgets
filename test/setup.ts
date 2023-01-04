import ResizeObserverPolyfill from 'resize-observer-polyfill'
import { TextDecoder, TextEncoder } from 'util'

global.TextDecoder = TextDecoder as typeof global.TextDecoder
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.ResizeObserver = ResizeObserverPolyfill
