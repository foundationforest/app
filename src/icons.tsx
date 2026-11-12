// The icons: Phosphor's, the one place they are imported, each by Phosphor's own name. Regular for an
// action; filled when it is selected, and inside an avatar or a badge. Each draws in its text's
// color, hidden from screen readers unless it is given words; an icon-only button gives them its
// own. The mark is not here: it is drawn once, in mark.tsx; nor are the markets' icons, which their
// files name and the build brings in (build/markets.ts, avatar.tsx).

import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  BellIcon,
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleHalfIcon,
  ClockIcon,
  CopyIcon,
  CrosshairIcon,
  EnvelopeSimpleIcon,
  ExportIcon,
  FingerprintSimpleIcon,
  FlagIcon,
  HandshakeIcon,
  HouseIcon,
  IdentificationCardIcon,
  InfoIcon,
  KeyIcon,
  ListNumbersIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  NotePencilIcon,
  PaintBrushIcon,
  PencilSimpleIcon,
  PlusIcon,
  QrCodeIcon,
  ScanSmileyIcon,
  SignOutIcon,
  SmileyIcon,
  SparkleIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  UserCircleIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react'

const ICONS = {
  'arrow-left': ArrowLeftIcon,
  'arrow-square-out': ArrowSquareOutIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-up-right': ArrowUpRightIcon,
  bell: BellIcon,
  'caret-down': CaretDownIcon,
  'caret-right': CaretRightIcon,
  'caret-up': CaretUpIcon,
  'chat-circle': ChatCircleIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'circle-half': CircleHalfIcon,
  clock: ClockIcon,
  copy: CopyIcon,
  crosshair: CrosshairIcon,
  'envelope-simple': EnvelopeSimpleIcon,
  export: ExportIcon,
  'fingerprint-simple': FingerprintSimpleIcon,
  flag: FlagIcon,
  handshake: HandshakeIcon,
  house: HouseIcon,
  'identification-card': IdentificationCardIcon,
  info: InfoIcon,
  key: KeyIcon,
  'list-numbers': ListNumbersIcon,
  'lock-simple': LockSimpleIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'map-pin': MapPinIcon,
  moon: MoonIcon,
  'note-pencil': NotePencilIcon,
  'paint-brush': PaintBrushIcon,
  'pencil-simple': PencilSimpleIcon,
  plus: PlusIcon,
  'qr-code': QrCodeIcon,
  'scan-smiley': ScanSmileyIcon,
  'sign-out': SignOutIcon,
  smiley: SmileyIcon,
  sparkle: SparkleIcon,
  star: StarIcon,
  sun: SunIcon,
  trash: TrashIcon,
  'user-circle': UserCircleIcon,
  warning: WarningIcon,
  'warning-circle': WarningCircleIcon,
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
