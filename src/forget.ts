// Forget this device: what it keeps (device.ts, all but the ids of the passkeys it knows, so Start
// asks for them and never makes a second one), and what the page holds: the seed, the messages
// opened, what the index said and what a market outgrew. The look goes back to the device's. From
// You, and from Your 24 words when the words open a different Forest.

import { forget } from './device.ts'
import { letGoOutgrown } from './flows/outgrown.ts'
import { drop } from './held.ts'
import { letGo } from './opened.ts'
import { letGoRated } from './rated.ts'
import { applyTheme } from './theme.ts'

export function forgetDevice(): void {
  forget()
  drop()
  letGo()
  letGoRated()
  letGoOutgrown()
  applyTheme('device')
}
