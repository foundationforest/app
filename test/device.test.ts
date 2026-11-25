// What the device keeps: at every start, nothing this app does not know; and Forget this device,
// which keeps only the passkey ids.

import { beforeEach, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { RELOADED } from '../src/version.ts'
import { OFFERS, OTHER_OFFERS } from './labels.ts'
import { freshDevice } from './world.ts'

beforeEach(freshDevice)

const ID = 'AbCdEfGhIjKlMnOpQrStUv'

test('at every start: what this app keeps stays, anything else goes, in sessionStorage too', () => {
  device.usePasskey(ID)
  device.saveProfiles([{ label: OFFERS, address: 'A' }])
  device.saveTheme('dark')
  device.saveChecks(['face', 'id'])
  device.saveCursors({ A: 42 })
  device.saveSeen({ A: 1_000 })
  device.keepIds([{ kind: 'Identity Card', country: 'MEX', until: '2031-04-30' }])
  localStorage.setItem('forest.used', '{"A":2000}')
  device.keepUnder({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  device.readLabels('W', { a: OFFERS })
  device.keepNames({ B: 'Rodrigo' })
  localStorage.setItem('stray', '1')
  localStorage.setItem('forest.v', '"2"')
  sessionStorage.setItem('forest.door', '/message')
  sessionStorage.setItem(RELOADED, 'v')
  sessionStorage.setItem('forest.waiting', JSON.stringify({ to: 'some-address' }))
  device.cleanOld()
  expect(Object.keys(localStorage).sort(), 'when each profile was last used, kept no more, goes too').toEqual(['forest.counted', 'forest.folder', 'forest.ids', 'forest.names', 'forest.passkey', 'forest.passkeys', 'forest.profiles', 'forest.read', 'forest.seen', 'forest.setup', 'forest.theme'])
  expect({ ...sessionStorage }, "the tab's reload flag, nothing else: a check never leaves the page, so nothing waits through one").toEqual({ [RELOADED]: 'v' })
  expect(device.under(), "the ID check's payment, kept while it is under way").toEqual({ passkey: ID, check: 'id', payment: 'cs_test_abc' })
  expect(device.theme()).toBe('dark')
})

test('a passkey deleted is asked for no more; Add a backup, once offered, is never offered again on this device', () => {
  device.knowPasskey('PasskeyOnePasskeyOnePass')
  device.knowPasskey('PasskeyTwoPasskeyTwoPass')
  device.unknowPasskey('PasskeyOnePasskeyOnePass')
  expect(device.passkeys()).toEqual(['PasskeyTwoPasskeyTwoPass'])
  expect(device.backupAsked()).toBe(false)
  device.askedBackup()
  expect(device.backupAsked()).toBe(true)
})

test("an ID as the device keeps it: its kind and own name, its country, its end and its entry's path, nothing else", () => {
  device.keepIds([{ kind: 'Identity Card', subtype: 'INE', country: 'MEX', until: '2031-04-30', path: 'stamp/0a1b' }])
  localStorage.setItem('forest.ids', JSON.stringify([...JSON.parse(localStorage.getItem('forest.ids')!), { kind: 'Passport', path: '../names', name: 'Someone' }]))
  expect(device.ids()).toEqual([{ kind: 'Identity Card', subtype: 'INE', country: 'MEX', until: '2031-04-30', path: 'stamp/0a1b' }, { kind: 'Passport' }])
})

test('Forget this device: everything but the ids of the passkeys it knows, so Start never makes a second one', () => {
  device.knowPasskey('OtherPasskeyIdOtherPass')
  device.usePasskey(ID)
  device.saveProfiles([{ label: OFFERS, address: 'A' }])
  device.saveTheme('light')
  device.saveChecks(['face'])
  device.saveCursors({ A: 7 })
  device.saveSeen({ A: 9 })
  device.keepUnder({ passkey: ID, check: 'face', session: 's' })
  device.keepConnection({ address: 'C', name: 'Claude', time: 1, labels: [OFFERS] })
  device.knowKeys(['K'])
  device.readLabels('W', { a: OFFERS })
  device.noteMade('b', { maker: 'Bitwarden' })
  device.keepNames({ B: 'Rodrigo' })
  device.keepIds([{ kind: 'Passport', country: 'ESP', until: '2032-05-11' }])
  device.forget()
  expect({ ...localStorage }).toEqual({ 'forest.passkeys': JSON.stringify(['OtherPasskeyIdOtherPass', ID]) })
  expect([device.passkey(), device.under(), device.theme(), device.checks(), device.cursors(), device.seen(), device.connections(), device.knownKeys(), device.folder(), device.madeHere(), device.ids(), device.names()]).toEqual([null, null, 'device', [], {}, {}, [], [], null, {}, [], {}])
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

test('when each profile was made, from the label entries read: the earliest for a label read twice, kept beside those read before, gone with another folder; anything else dropped', () => {
  device.readLabels('W', { a: OFFERS, b: OTHER_OFFERS }, { a: 30, b: 10 })
  device.readLabels('W', { c: OFFERS }, { c: 20 })
  expect(device.madeOf()).toEqual({ [OFFERS]: 20, [OTHER_OFFERS]: 10 })
  device.readLabels('W', { d: OFFERS })
  expect(device.madeOf(), 'one with no time changes nothing').toEqual({ [OFFERS]: 20, [OTHER_OFFERS]: 10 })
  device.readLabels('V', { e: OFFERS }, { e: 5 })
  expect(device.madeOf(), "another folder's, alone").toEqual({ [OFFERS]: 5 })
  localStorage.setItem('forest.folder', JSON.stringify({ address: 'W', labels: { a: OFFERS, b: OTHER_OFFERS }, made: { a: 'then', b: 1.5 } }))
  expect(device.madeOf()).toEqual({})
  localStorage.setItem('forest.folder', JSON.stringify({ address: 'W', labels: { a: OFFERS } }))
  expect(device.folder(), 'one kept before times were').toEqual({ address: 'W', labels: { a: OFFERS }, made: {} })
})

test("each ID stamp's kind, country and end, as the Profiles folder's say them: in place of what was kept; none, nothing kept; anything else dropped", () => {
  device.keepIds([{ kind: 'Identity Card', country: 'MEX', until: '2031-04-30' }, {}])
  expect(device.ids()).toEqual([{ kind: 'Identity Card', country: 'MEX', until: '2031-04-30' }, {}])
  device.keepIds([])
  expect(localStorage.getItem('forest.ids')).toBeNull()
  localStorage.setItem('forest.ids', JSON.stringify([{ kind: 7, country: 'ESP' }, 'x', null]))
  expect(device.ids()).toEqual([{ country: 'ESP' }])
})

test('AI apps, one per connection, oldest first, each its profiles once in label order; the keys it knows of, once each; anything else dropped', () => {
  device.keepConnection({ address: 'B', name: 'ChatGPT', time: 20, labels: [OFFERS] })
  device.keepConnection({ address: 'A', name: 'Claude', time: 10, labels: [OFFERS, OTHER_OFFERS, OFFERS] })
  expect(device.connections()).toEqual([
    { address: 'A', name: 'Claude', time: 10, labels: [OTHER_OFFERS, OFFERS].sort() },
    { address: 'B', name: 'ChatGPT', time: 20, labels: [OFFERS] },
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
  device.readLabels('W', { a: OFFERS })
  device.readLabels('W', { b: '' })
  expect(device.folder()).toEqual({ address: 'W', labels: { a: OFFERS, b: '' }, made: {} })
  device.readLabels('V', { c: OTHER_OFFERS })
  expect(device.folder(), "another folder's").toEqual({ address: 'V', labels: { c: OTHER_OFFERS }, made: {} })
  localStorage.setItem('forest.folder', JSON.stringify({ address: 'V', labels: { c: OTHER_OFFERS, d: 7 } }))
  expect(device.folder()).toEqual({ address: 'V', labels: { c: OTHER_OFFERS }, made: {} })
  localStorage.setItem('forest.folder', JSON.stringify('V'))
  expect(device.folder()).toBeNull()
})

test('profiles, one per label, in label order', () => {
  device.saveProfiles([
    { label: OFFERS, address: 'B' },
    { label: OTHER_OFFERS, address: 'A' },
  ])
  device.addProfile({ label: OFFERS, address: 'B' })
  expect(device.profiles().map((p) => p.label)).toEqual([OTHER_OFFERS, OFFERS].sort())
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
  localStorage.setItem('forest.counted', JSON.stringify(['face', 'palm']))
  expect(device.checks()).toEqual(['face'])
  // Kept before the verifier's keys changed (both at services#144, the ID key at services#123), so
  // maybe from a key it no longer signs with: cleared at the next start.
  localStorage.setItem('forest.checks', JSON.stringify(['face', 'id']))
  localStorage.setItem('forest.verified', JSON.stringify(['face']))
  device.cleanOld()
  expect([localStorage.getItem('forest.checks'), localStorage.getItem('forest.verified')]).toEqual([null, null])
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
