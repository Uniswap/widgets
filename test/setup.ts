import { TextDecoder, TextEncoder } from 'util'

global.TextDecoder = TextDecoder as typeof global.TextDecoder
global.TextEncoder = TextEncoder as typeof global.TextEncoder
