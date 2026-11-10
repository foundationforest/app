// The icons: Phosphor's, the one place they are imported, each by Phosphor's own name. Regular for an
// action; filled when it is selected, and inside an avatar or a badge. Each draws in its text's
// color, hidden from screen readers unless it is given words; an icon-only button gives them its
// own. The mark is not here: it is drawn once, in mark.tsx.

import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  BellIcon,
  BroomIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleHalfIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  CrosshairIcon,
  ExportIcon,
  FingerprintSimpleIcon,
  FlagIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HouseIcon,
  IdentificationCardIcon,
  LaptopIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  NotePencilIcon,
  PlusIcon,
  QrCodeIcon,
  SmileyIcon,
  SoccerBallIcon,
  SparkleIcon,
  StarIcon,
  SunIcon,
  TShirtIcon,
  TennisBallIcon,
  UserCircleIcon,
  WarningCircleIcon,
  WarningIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react'

const ICONS = {
  'arrow-left': ArrowLeftIcon,
  'arrow-square-out': ArrowSquareOutIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-up-right': ArrowUpRightIcon,
  bell: BellIcon,
  broom: BroomIcon,
  'caret-down': CaretDownIcon,
  'caret-right': CaretRightIcon,
  'chat-circle': ChatCircleIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'circle-half': CircleHalfIcon,
  clock: ClockIcon,
  code: CodeIcon,
  copy: CopyIcon,
  crosshair: CrosshairIcon,
  export: ExportIcon,
  'fingerprint-simple': FingerprintSimpleIcon,
  flag: FlagIcon,
  'graduation-cap': GraduationCapIcon,
  handshake: HandshakeIcon,
  house: HouseIcon,
  'identification-card': IdentificationCardIcon,
  laptop: LaptopIcon,
  'lock-simple': LockSimpleIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'map-pin': MapPinIcon,
  moon: MoonIcon,
  'note-pencil': NotePencilIcon,
  plus: PlusIcon,
  'qr-code': QrCodeIcon,
  smiley: SmileyIcon,
  'soccer-ball': SoccerBallIcon,
  sparkle: SparkleIcon,
  star: StarIcon,
  sun: SunIcon,
  't-shirt': TShirtIcon,
  'tennis-ball': TennisBallIcon,
  'user-circle': UserCircleIcon,
  warning: WarningIcon,
  'warning-circle': WarningCircleIcon,
  wrench: WrenchIcon,
  x: XIcon,
} as const

export type IconName = keyof typeof ICONS

export const isIcon = (name: string): name is IconName => Object.hasOwn(ICONS, name)

type Props = { name: IconName; fill?: boolean; bold?: boolean; className?: string; label?: string }

/** One icon, by its Phosphor name: regular, or filled, or bold where a small one must hold its weight. */
export function Icon({ name, fill = false, bold = false, className, label }: Props) {
  const Drawn = ICONS[name]
  return <Drawn className={className ? `icon ${className}` : 'icon'} weight={fill ? 'fill' : bold ? 'bold' : 'regular'} data-icon={name} focusable="false" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })} />
}
