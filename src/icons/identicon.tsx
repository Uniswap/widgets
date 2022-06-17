import useActiveWeb3React from 'hooks/connectWeb3/useActiveWeb3React'
import useENSAvatar from 'hooks/useENSAvatar'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'

const StyledIdenticon = styled.div`
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 1.125rem;
  font-size: initial;
  height: 1rem;
  width: 1rem;
`

const StyledAvatar = styled.img`
  border-radius: inherit;
  height: inherit;
  width: inherit;
`

function accountAvatar(account: string) {
  const num = parseInt(account.slice(2, 10), 16)
  const avatarIndex = num % 8
  return avatars[avatarIndex]
}

export default function Identicon() {
  const { account } = useActiveWeb3React()
  const { avatar } = useENSAvatar(account ?? undefined)
  const [fetchable, setFetchable] = useState(true)

  const icon = useMemo(() => account && accountAvatar(account), [account])
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
          console.error('Avatar icon not found')
        }
      }
    }
    return
  }, [icon, iconRef])

  return (
    <StyledIdenticon>
      {avatar && fetchable ? (
        <StyledAvatar alt="avatar" src={avatar} onError={() => setFetchable(false)}></StyledAvatar>
      ) : (
        <span ref={iconRef} />
      )}
    </StyledIdenticon>
  )
}
