import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { WarningSeverity } from 'utils/prices'

export const ErrorText = styled(Text)<{ severity?: WarningSeverity }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4 ? theme.error : severity === 2 ? theme.warning : theme.primary};
`
