// What the device keeps: the earlier app's storage cleared at the first start, its passkey ids kept,
// so the passkeys made with it count here; at every start, nothing this app does not know; and
// Forget this device, which keeps only the passkey ids.

import { beforeEach, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { freshDevice } from './world.ts'

beforeEach(freshDevice)

const ID = 'AbCdEfGhIjKlMnOpQrStUv'

test("the earlier app's storage: cleared at the first start, its passkey ids kept", () => {
  // What the earlier app left at this origin, from an architecture that is gone.
  for (const [k, v] of Object.entries({
    'forest.fingerprint': '"4H5vL1ymZQ8cp7kCmjZw1vWcGPnHYxnMJ9TtjvnhujGu"',
    'forest.passkeys': JSON.stringify([ID, 42, 'not an id']),
    'forest.profiles': JSON.stringify([{ label: 'tutoring/seller', address: 'old', hosts: ['https://old.example'] }]),
    'forest.settings': '{"host":"https://old.example"}',
    'forest.setup': '{"v":1,"made":true}',
    'forest.appearance': '"dark"',
    'forest.hidden': '[]',
    other: 'x',
  }))
    localStorage.setItem(k, v)
  sessionStorage.setItem('forest.door', '/message')
  sessionStorage.setItem('forest.reloaded', 'v')
  device.cleanOld()
  expect({ ...localStorage }).toEqual({ 'forest.v': '"2"', 'forest.passkeys': JSON.stringify([ID]) })
  expect({ ...sessionStorage }).toEqual({ 'forest.reloaded': 'v' })
  expect(device.passkeys()).toEqual([ID])
  expect(device.passkey(), 'none in use until Start verifies someone').toBeNull()
  expect(device.profiles()).toEqual([])
})

test('at every start: what this app keeps stays, anything else goes', () => {
  device.cleanOld()
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveTheme('dark')
  localStorage.setItem('stray', '1')
  device.cleanOld()
  expect(Object.keys(localStorage).sort()).toEqual(['forest.passkey', 'forest.passkeys', 'forest.profiles', 'forest.theme', 'forest.v'])
  expect(device.theme()).toBe('dark')
})

test('Forget this device: everything but the ids of the passkeys it knows, so Start never makes a second one', () => {
  device.cleanOld()
  device.knowPasskey('OtherPasskeyIdOtherPass')
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveTheme('light')
  device.keepUnder({ passkey: ID, session: 's' })
  device.forget()
  expect({ ...localStorage }).toEqual({ 'forest.v': '"2"', 'forest.passkeys': JSON.stringify(['OtherPasskeyIdOtherPass', ID]) })
  expect([device.passkey(), device.under(), device.theme()]).toEqual([null, null, 'device'])
})

test('profiles, one per label, in label order', () => {
  device.saveProfiles([
    { label: 'tutoring/tutor', address: 'B' },
    { label: 'clothing/seller', address: 'A' },
  ])
  device.addProfile({ label: 'tutoring/tutor', address: 'B' })
  expect(device.profiles().map((p) => p.label)).toEqual(['clothing/seller', 'tutoring/tutor'])
})
