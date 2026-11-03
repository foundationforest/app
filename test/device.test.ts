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
  device.saveChecks(['face', 'id'])
  device.saveCursors({ A: 42 })
  device.saveSeen({ A: 1_000 })
  device.keepUnder({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  device.readLabels('W', { a: 'tutoring/tutor' })
  localStorage.setItem('stray', '1')
  device.cleanOld()
  expect(Object.keys(localStorage).sort()).toEqual(['forest.checks', 'forest.folder', 'forest.passkey', 'forest.passkeys', 'forest.profiles', 'forest.read', 'forest.seen', 'forest.setup', 'forest.theme', 'forest.v'])
  expect(device.under(), "the ID check's payment, kept while it is under way").toEqual({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  expect(device.theme()).toBe('dark')
})

test('Forget this device: everything but the ids of the passkeys it knows, so Start never makes a second one', () => {
  device.cleanOld()
  device.knowPasskey('OtherPasskeyIdOtherPass')
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveTheme('light')
  device.saveChecks(['face'])
  device.saveCursors({ A: 7 })
  device.saveSeen({ A: 9 })
  device.keepUnder({ passkey: ID, session: 's' })
  device.keepConnection({ address: 'C', name: 'Claude', time: 1, labels: ['tutoring/tutor'] })
  device.knowKeys(['K'])
  device.readLabels('W', { a: 'tutoring/tutor' })
  device.nameBackup('b', 'Bitwarden')
  device.forget()
  expect({ ...localStorage }).toEqual({ 'forest.v': '"2"', 'forest.passkeys': JSON.stringify(['OtherPasskeyIdOtherPass', ID]) })
  expect([device.passkey(), device.under(), device.theme(), device.checks(), device.cursors(), device.seen(), device.connections(), device.knownKeys(), device.folder(), device.backupNames()]).toEqual([null, null, 'device', [], {}, {}, [], [], null, {}])
})

test("the backups' names: each by its entry's id, one dropped alone, anything else dropped; kept through a start", () => {
  device.cleanOld()
  device.nameBackup('a', '1Password')
  device.nameBackup('b', 'Bitwarden')
  device.unnameBackup('a')
  expect(device.backupNames()).toEqual({ b: 'Bitwarden' })
  localStorage.setItem('forest.backups', JSON.stringify({ b: 'Bitwarden', c: 7 }))
  device.cleanOld()
  expect(device.backupNames()).toEqual({ b: 'Bitwarden' })
})

test('AI apps, one per connection, oldest first, each its profiles once in label order; the keys it knows of, once each; anything else dropped', () => {
  device.keepConnection({ address: 'B', name: 'ChatGPT', time: 20, labels: ['tutoring/tutor'] })
  device.keepConnection({ address: 'A', name: 'Claude', time: 10, labels: ['tutoring/tutor', 'clothing/seller', 'tutoring/tutor'] })
  expect(device.connections()).toEqual([
    { address: 'A', name: 'Claude', time: 10, labels: ['clothing/seller', 'tutoring/tutor'] },
    { address: 'B', name: 'ChatGPT', time: 20, labels: ['tutoring/tutor'] },
  ])
  device.keepConnection({ address: 'B', name: 'ChatGPT', time: 20, labels: [] })
  device.dropConnection('A')
  expect(device.connections()).toEqual([{ address: 'B', name: 'ChatGPT', time: 20, labels: [] }])
  localStorage.setItem('forest.connections', JSON.stringify([{ address: 'B', name: 'ChatGPT', time: 20, labels: [] }, { address: 'C', name: 'Claude', time: 'then', labels: [] }, { address: 'D', name: 'Claude', time: 1, labels: [7] }, null]))
  expect(device.connections().map((c) => c.address)).toEqual(['B'])
  device.knowKeys(['K2', 'K1'])
  device.knowKeys(['K1', 'K3'])
  expect(device.knownKeys()).toEqual(['K1', 'K2', 'K3'])
  device.saveKnownKeys(['K4'])
  expect(device.knownKeys()).toEqual(['K4'])
  localStorage.setItem('forest.known', JSON.stringify(['K4', 5, null]))
  expect(device.knownKeys()).toEqual(['K4'])
})

test("the Profiles folder: its address, and each label entry read there with its label, kept together; another folder's in their place; anything else dropped", () => {
  expect(device.folder()).toBeNull()
  device.readLabels('W', { a: 'tutoring/tutor' })
  device.readLabels('W', { b: '' })
  expect(device.folder()).toEqual({ address: 'W', labels: { a: 'tutoring/tutor', b: '' } })
  device.readLabels('V', { c: 'clothing/seller' })
  expect(device.folder(), "another folder's").toEqual({ address: 'V', labels: { c: 'clothing/seller' } })
  localStorage.setItem('forest.folder', JSON.stringify({ address: 'V', labels: { c: 'clothing/seller', d: 7 } }))
  expect(device.folder()).toEqual({ address: 'V', labels: { c: 'clothing/seller' } })
  localStorage.setItem('forest.folder', JSON.stringify('V'))
  expect(device.folder()).toBeNull()
})

test('profiles, one per label, in label order', () => {
  device.saveProfiles([
    { label: 'tutoring/tutor', address: 'B' },
    { label: 'clothing/seller', address: 'A' },
  ])
  device.addProfile({ label: 'tutoring/tutor', address: 'B' })
  expect(device.profiles().map((p) => p.label)).toEqual(['clothing/seller', 'tutoring/tutor'])
})

test("how the person is verified, and where they left off in each inbox: kept as given, anything else dropped", () => {
  device.saveChecks(['id', 'face', 'id'])
  expect(device.checks()).toEqual(['face', 'id'])
  localStorage.setItem('forest.checks', JSON.stringify(['face', 'palm']))
  expect(device.checks()).toEqual(['face'])
  device.saveCursors({ A: 3 })
  device.saveCursors({ B: 5 })
  expect(device.cursors()).toEqual({ A: 3, B: 5 })
  localStorage.setItem('forest.read', JSON.stringify({ A: 3, B: 'five', C: 1.5 }))
  expect(device.cursors()).toEqual({ A: 3 })
})

test("what is new on each profile: the marks kept as given, anything else dropped; a profile made here marked at the start, and never marked back", () => {
  device.saveSeen({ A: 3 })
  localStorage.setItem('forest.seen', JSON.stringify({ A: 3, B: 'five', C: 1.5 }))
  expect(device.seen()).toEqual({ A: 3 })
  device.markNew('D')
  expect([device.cursors().D, device.seen().D]).toEqual([0, 0])
  device.saveCursors({ D: 12 })
  device.saveSeen({ D: 40 })
  device.markNew('D')
  expect([device.cursors().D, device.seen().D], 'a mark already there stays').toEqual([12, 40])
})
