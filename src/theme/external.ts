/**
 * Extends styled-components' DefaultTheme using declaration merging:
 * https://styled-components.com/docs/api#create-a-declarations-file
 *
 * This file is explicitly named "external.ts" so that it will be stripped when built.
 * This is necessary to prevent DefaultTheme from conflicting with other users' redefinitions.
 */

import { Attributes, Colors, ThemeBorderRadius } from './theme'

declare module 'styled-components/macro' {
  export interface DefaultTheme extends Omit<Attributes, 'borderRadius'>, Colors {
    borderRadius: ThemeBorderRadius
    onHover: (color: string) => string
  }
}
