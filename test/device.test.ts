// What the device keeps: at every start, nothing this app does not know; and Forget this device,
// which keeps only the passkey ids.

import { beforeEach, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { RELOADED } from '../src/version.ts'
import { freshDevice } from './world.ts'

beforeEach(freshDevice)

const ID = 'AbCdEfGhIjKlMnOpQrStUv'

test('at every start: what this app keeps stays, anything else goes, in sessionStorage too', () => {
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveTheme('dark')
  device.saveChecks(['face', 'id'])
  device.saveCursors({ A: 42 })
  device.saveSeen({ A: 1_000 })
  device.markUsed('A', 2_000)
  device.keepUnder({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  device.readLabels('W', { a: 'tutoring/tutor' })
  device.keepNames({ B: 'Rodrigo' })
  localStorage.setItem('stray', '1')
  localStorage.setItem('forest.v', '"2"')
  sessionStorage.setItem('forest.door', '/message')
  sessionStorage.setItem(RELOADED, 'v')
  device.cleanOld()
  expect(Object.keys(localStorage).sort()).toEqual(['forest.folder', 'forest.names', 'forest.passkey', 'forest.passkeys', 'forest.profiles', 'forest.read', 'forest.seen', 'forest.setup', 'forest.theme', 'forest.used', 'forest.verified'])
  expect({ ...sessionStorage }, 'the tab\'s reload flag, and nothing else').toEqual({ [RELOADED]: 'v' })
  expect(device.under(), "the ID check's payment, kept while it is under way").toEqual({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  expect(device.theme()).toBe('dark')
})

test('Forget this device: everything but the ids of the passkeys it knows, so Start never makes a second one', () => {
  device.knowPasskey('OtherPasskeyIdOtherPass')
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveTheme('light')
  device.saveChecks(['face'])
  device.saveCursors({ A: 7 })
  device.saveSeen({ A: 9 })
  device.keepUnder({ passkey: ID, check: 'face', session: 's' })
  device.keepConnection({ address: 'C', name: 'Claude', time: 1, labels: ['tutoring/tutor'] })
  device.knowKeys(['K'])
  device.readLabels('W', { a: 'tutoring/tutor' })
  device.noteMade('b', { maker: 'Bitwarden' })
  device.keepNames({ B: 'Rodrigo' })
  device.markUsed('A')
  device.keepPoint({ lat: '40.420', lon: '-3.700' })
  device.forget()
  expect({ ...localStorage }).toEqual({ 'forest.passkeys': JSON.stringify(['OtherPasskeyIdOtherPass', ID]) })
  expect([device.passkey(), device.under(), device.theme(), device.checks(), device.cursors(), device.seen(), device.connections(), device.knownKeys(), device.folder(), device.madeHere(), device.points(), device.used(), device.names()]).toEqual([null, null, 'device', [], {}, {}, [], [], null, {}, [], {}, {}])
})

test("the passkeys it made or added: each by its entry's id, or the first's, its maker and the name it was given; one dropped alone; anything else dropped; kept through a start", () => {
  device.noteMade('a', { maker: '1Password' })
  device.noteMade('b', { maker: 'Bitwarden', name: 'Work' })
  device.noteMade(device.FIRST, { name: 'Phone' })
  device.noteMade('c', {})
  device.unnoteMade('a')
  expect(device.madeHere()).toEqual({ b: { maker: 'Bitwarden', name: 'Work' }, first: { name: 'Phone' } })
  localStorage.setItem('forest.backups', JSON.stringify({ b: { maker: 'Bitwarden' }, c: 7, d: { here: 'yes' }, e: { maker: 3, name: '' }, f: [] }))
  device.cleanOld()
  expect(device.madeHere()).toEqual({ b: { maker: 'Bitwarden' } })
})

test('the names given others: the Profiles folder\'s, in place of what was kept; none, nothing kept; anything else dropped', () => {
  device.keepNames({ A: 'Rodrigo', B: 'Ana' })
  device.keepNames({ B: 'Ana' })
  expect(device.names()).toEqual({ B: 'Ana' })
  device.keepNames({})
  expect(localStorage.getItem('forest.names')).toBeNull()
  localStorage.setItem('forest.names', JSON.stringify({ A: 'Rodrigo', B: 7, C: '' }))
  expect(device.names()).toEqual({ A: 'Rodrigo' })
})

test('when each profile was last used, by its address: kept as given, the latest in place of the one before, anything else dropped', () => {
  device.markUsed('A', 10)
  device.markUsed('B', 20)
  device.markUsed('A', 30)
  expect(device.used()).toEqual({ A: 30, B: 20 })
  localStorage.setItem('forest.used', JSON.stringify({ A: 30, B: 'then', C: 1.5 }))
  expect(device.used()).toEqual({ A: 30 })
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

test('a verification under way: kept with its check; one kept without its passkey or its check is none', () => {
  device.keepUnder({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  expect(device.under()).toEqual({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  localStorage.setItem('forest.setup', JSON.stringify({ passkey: ID, session: 's' }))
  expect(device.under()).toBeNull()
  localStorage.setItem('forest.setup', JSON.stringify({ check: 'face', session: 's' }))
  expect(device.under()).toBeNull()
})

test("how the person is verified, and where they left off in each inbox: kept as given, anything else dropped", () => {
  device.saveChecks(['id', 'face', 'id'])
  expect(device.checks()).toEqual(['face', 'id'])
  device.saveChecks(['face'])
  expect(device.checks(), 'worked out fresh: the list given, in place of the one before').toEqual(['face'])
  localStorage.setItem('forest.verified', JSON.stringify(['face', 'palm']))
  expect(device.checks()).toEqual(['face'])
  // Kept before the verifier's ID key changed, so maybe from the old key: cleared at the next start.
  localStorage.setItem('forest.checks', JSON.stringify(['face', 'id']))
  device.cleanOld()
  expect(localStorage.getItem('forest.checks')).toBeNull()
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
