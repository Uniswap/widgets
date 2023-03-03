import { ReactComponent as CheckIcon } from 'assets/svg/check.svg'
import { ReactComponent as ExpandoIcon } from 'assets/svg/expando.svg'
import { ReactComponent as GasIcon } from 'assets/svg/gasIcon.svg'
import { ReactComponent as LargeArrowIcon } from 'assets/svg/large_arrow.svg'
import { ReactComponent as LargeCheckIcon } from 'assets/svg/large_check.svg'
import { ReactComponent as LargeSpinnerIcon } from 'assets/svg/large_spinner.svg'
import { ReactComponent as LogoIcon } from 'assets/svg/logo.svg'
import { ReactComponent as ReverseIcon } from 'assets/svg/reverse.svg'
import { ReactComponent as SpinnerIcon } from 'assets/svg/spinner.svg'
import { ReactComponent as WalletIcon } from 'assets/svg/wallet.svg'
import { ReactComponent as WalletDisconnectIcon } from 'assets/svg/wallet_disconnect.svg'
import { iconHoverCss } from 'css/hover'
import { FunctionComponent, SVGProps } from 'react'
// This file wraps react-feather, so its import is intentional.
/* eslint-disable no-restricted-imports */
import { Icon as FeatherIcon } from 'react-feather'
import {
  AlertTriangle as AlertTriangleIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  ArrowUpRight as LinkIcon,
  BarChart2 as BarChart2Icon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Clock as ClockIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Slash as SlashIcon,
  Trash2 as Trash2Icon,
  X as XIcon,
  XOctagon as XOctagonIcon,
} from 'react-feather'
/* eslint-enable no-restricted-imports */
import styled, { css, keyframes } from 'styled-components/macro'
import { AnimationSpeed, Color, TransitionDuration } from 'theme'

import AutoRouterIcon from './AutoRouterIcon'
import IdenticonIcon from './identicon'

type SVGIcon = FunctionComponent<SVGProps<SVGSVGElement>>

// Intentionally uses `em` in order to scale with font size.
function icon(Icon: FeatherIcon | SVGIcon) {
  return styled(Icon)<{ color?: Color }>`
    clip-path: stroke-box;
    height: 1em;
    stroke: ${({ color = 'currentColor', theme }) => theme[color]};
    width: 1em;
  `
}

export const largeIconCss = css<{ iconSize: number }>`
  display: flex;

  svg {
    align-self: center;
    height: ${({ iconSize }) => iconSize}em;
    width: ${({ iconSize }) => iconSize}em;
  }
`

const LargeWrapper = styled.div<{ iconSize: number }>`
  height: ${({ iconSize }) => iconSize}em;
  width: ${({ iconSize }) => iconSize}em;
  ${largeIconCss}
`

export type Icon = ReturnType<typeof icon> | typeof LargeIcon

interface LargeIconProps {
  icon?: Icon
  color?: Color
  size?: number
  strokeWidth?: number
  onClick?: () => void
  className?: string
}

export function LargeIcon({ icon: Icon, color, size = 1.2, strokeWidth = 1.5, onClick, className }: LargeIconProps) {
  return (
    <LargeWrapper color={color} iconSize={size} className={className}>
      {Icon && <Icon color={color} strokeWidth={strokeWidth} onClick={onClick} />}
    </LargeWrapper>
  )
}

export const AlertTriangle = icon(AlertTriangleIcon)
export const ArrowDown = icon(ArrowDownIcon)
export const ArrowRight = icon(ArrowRightIcon)
export const ArrowLeft = icon(ArrowLeftIcon)
export const ArrowUp = icon(ArrowUpIcon)
export const BarChart = icon(BarChart2Icon)
export const ChevronDown = icon(ChevronDownIcon)
export const ChevronUp = icon(ChevronUpIcon)
export const Clock = icon(ClockIcon)
export const HelpCircle = icon(HelpCircleIcon)
export const Identicon = icon(IdenticonIcon)
export const Info = icon(InfoIcon)
export const Link = icon(LinkIcon)
export const AutoRouter = icon(AutoRouterIcon)
export const Settings = icon(SettingsIcon)
export const Slash = icon(SlashIcon)
export const Trash2 = icon(Trash2Icon)
export const Wallet = icon(WalletIcon)
export const X = icon(XIcon)
export const XOctagon = icon(XOctagonIcon)
export const Reverse = icon(ReverseIcon)
export const Search = icon(SearchIcon)

export const Check = styled(icon(CheckIcon))<{ color?: Color }>`
  circle {
    fill: ${({ theme, color }) => theme[color ?? 'active']};
    stroke: none;
  }
`

export const Expando = styled(icon(ExpandoIcon))<{ open: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(0deg)' : 'rotate(-180deg)')};
  transition: transform ${AnimationSpeed.Medium};
`

export const Logo = styled(icon(LogoIcon))`
  fill: ${({ theme }) => theme.secondary};
  stroke: none;
`

export const WalletDisconnect = styled(icon(WalletDisconnectIcon))<{ color?: Color }>`
  fill: currentColor;
  stroke: none;
`

export const rotate = keyframes`
  from {
    transform: rotate(-45deg);
  }
  to {
    transform: rotate(315deg);
  }
`

export const Spinner = styled(icon(SpinnerIcon))<{ color?: Color }>`
  animation: ${rotate} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  color: ${({ color = 'active', theme }) => theme[color]};
  fill: ${({ color = 'active', theme }) => theme[color]};
  transition: color ${TransitionDuration.Medium}ms ease, fill ${TransitionDuration.Medium}ms ease;
  #dot {
    fill: ${({ theme }) => theme.interactive};
  }
`

export const LargeCheck = styled(icon(LargeCheckIcon))<{ color?: Color }>`
  stroke: ${({ color = 'primary', theme }) => theme[color]};
`

export const LargeAlert = styled(LargeIcon).attrs({ icon: AlertTriangle, color: 'error', size: 6, strokeWidth: 1 })``

export const LargeSpinner = styled(icon(LargeSpinnerIcon))<{ color?: Color }>`
  animation: 2s ${rotate} linear infinite;
  stroke: ${({ color = 'primary', theme }) => theme[color]};
`

export const LargeArrow = styled(icon(LargeArrowIcon))<{ color?: Color }>`
  stroke: ${({ color = 'primary', theme }) => theme[color]};
`

export const Gas = styled(icon(GasIcon))<{ color?: Color }>`
  fill: ${({ color = 'active', theme }) => theme[color]};
  stroke: ${({ color = 'active', theme }) => theme[color]};
`

export const StyledXButton = styled(X)`
  ${iconHoverCss}
  stroke-width: 2.5px;
`
