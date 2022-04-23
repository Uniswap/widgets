import fetchMock from 'jest-fetch-mock'
import { TextDecoder, TextEncoder } from 'util'

fetchMock.enableMocks()

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
