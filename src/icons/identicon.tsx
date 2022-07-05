import { useWeb3React } from '@web3-react/core'
import IdenticonGradient0 from 'assets/images/identicons/IdenticonGradient-0.png'
import IdenticonGradient1 from 'assets/images/identicons/IdenticonGradient-1.png'
import IdenticonGradient2 from 'assets/images/identicons/IdenticonGradient-2.png'
import IdenticonGradient3 from 'assets/images/identicons/IdenticonGradient-3.png'
import IdenticonGradient4 from 'assets/images/identicons/IdenticonGradient-4.png'
import IdenticonGradient5 from 'assets/images/identicons/IdenticonGradient-5.png'
import IdenticonGradient6 from 'assets/images/identicons/IdenticonGradient-6.png'
import IdenticonGradient7 from 'assets/images/identicons/IdenticonGradient-7.png'
import IdenticonGradient8 from 'assets/images/identicons/IdenticonGradient-8.png'
import IdenticonGradient9 from 'assets/images/identicons/IdenticonGradient-9.png'
import { useMemo } from 'react'

const gradients = [
  IdenticonGradient0,
  IdenticonGradient1,
  IdenticonGradient2,
  IdenticonGradient3,
  IdenticonGradient4,
  IdenticonGradient5,
  IdenticonGradient6,
  IdenticonGradient7,
  IdenticonGradient8,
  IdenticonGradient9,
]

function getGradientIconSrc(account: string) {
  const num = parseInt(account.slice(2, 10), 16)
  const i = num % 10
  return gradients[i]
}

export default function IdenticonIcon() {
  const { account } = useWeb3React()
  const iconSrc = useMemo(() => account && getGradientIconSrc(account), [account])

  return <img src={iconSrc} alt="account icon" width="16px" height="16px" />
}
