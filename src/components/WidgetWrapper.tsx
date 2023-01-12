import styled from 'styled-components/macro'

const HORIZONTAL_PADDING = 8

const StyledWidgetWrapper = styled.div`
  background-color: ${({ theme }) => theme.container};
  border: ${({ theme }) => `1px solid ${theme.outline}`};
  border-radius: ${({ theme }) => theme.borderRadius}em;
  box-shadow: ${({ theme }) => `0px 40px 120px 0px ${theme.networkDefaultShadow}`};
  color: ${({ theme }) => theme.primary};
  padding: ${HORIZONTAL_PADDING}px;
`

export default StyledWidgetWrapper
