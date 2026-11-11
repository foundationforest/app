// Where a passkey lives, from the id it sends as it is made (its AAGUID): its maker's short name when
// the table has it (Apple, Google), else Passkey; its logo's square; a name repeated in a list taking
// the next number (Apple 2); and what the device kept before it kept makers, a manager's full name,
// read as its maker, on the device that made it.

import { beforeEach, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { PASSKEY, aaguidOf, logoOf, makerBefore, makerOf, nameOf, numbered } from '../src/managers.ts'
import { freshDevice } from './world.ts'

beforeEach(freshDevice)

/** Authenticator data as a new passkey's carries it: the relying party's hash, the flags, the counter, then the AAGUID. */
const data = (flags: number, aaguid: number[]) => new Uint8Array([...new Array<number>(32).fill(7), flags, 0, 0, 0, 0, ...aaguid, 0, 16])
/** An AAGUID no maker in the table sends. */
const UNKNOWN = [0xba, 0xda, 0x55, 0x66, 0xa7, 0xaa, 0x4b, 0x8c, 0xb6, 0x6a, 0x6d, 0x4f, 0x1f, 0x54, 0xd1, 0x34]

test('the AAGUID a new passkey carries: read after the hash, the flags and the counter; nothing for zeros, no attested data, or too little', () => {
  const id = aaguidOf(data(0x45, [0xba, 0xda, 0x55, 0x66, 0xa7, 0xaa, 0x40, 0x1f, 0xbd, 0x96, 0x45, 0x61, 0x9a, 0x55, 0x12, 0x0d]))
  expect(id).toBe('bada5566-a7aa-401f-bd96-45619a55120d')
  expect(aaguidOf(data(0x45, new Array<number>(16).fill(0))), 'zeros name nothing').toBeUndefined()
  expect(aaguidOf(data(0x05, UNKNOWN)), 'no attested data').toBeUndefined()
  expect(aaguidOf(new Uint8Array(37)), 'too short').toBeUndefined()
})

test("each maker by its short name, whichever of its ids it sends, in either case; an id the table lacks, or none, names nothing", () => {
  expect(makerOf('bada5566-a7aa-401f-bd96-45619a55120d')).toBe('1Password')
  expect(makerOf('BADA5566-A7AA-401F-BD96-45619A55120D')).toBe('1Password')
  expect(['fbfc3007-154e-4ecc-8c0b-6e020557d7bd', 'dd4ec289-e01d-41c9-bb89-70fa845d4bf2'].map(makerOf), "Apple Passwords, iCloud Keychain").toEqual(['Apple', 'Apple'])
  expect(['ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4', 'adce0002-35bc-c60a-648b-0b25f1f05503'].map(makerOf), "Google Password Manager, Chrome on Mac").toEqual(['Google', 'Google'])
  expect(['08987058-cadc-4b81-b6e1-30de50dcbe96', 'd3452668-01fd-4c12-926c-83a4204853aa', '771b48fd-d3d4-4f74-9232-fc157ab0507a'].map(makerOf), 'Windows Hello, Microsoft Password Manager, Edge on Mac').toEqual(['Microsoft', 'Microsoft', 'Microsoft'])
  expect(makerOf('53414d53-554e-4700-0000-000000000000')).toBe('Samsung')
  expect(makerOf(aaguidOf(data(0x45, UNKNOWN))), 'an id the table lacks').toBeUndefined()
  expect(makerOf(undefined)).toBeUndefined()
  expect(makerOf('constructor'), 'nothing the table inherits').toBeUndefined()
})

test("a passkey's name: the one it was given, else its maker's, else Passkey; its square, Apple's or Google's logo, else a key", () => {
  expect([nameOf({ maker: 'Apple', name: 'Work phone' }), nameOf({ maker: 'Apple' }), nameOf({}), nameOf(undefined)]).toEqual(['Work phone', 'Apple', PASSKEY, 'Passkey'])
  expect([logoOf('Apple'), logoOf('Google'), logoOf('1Password'), logoOf(undefined)]).toEqual(['apple-logo', 'google-logo', 'key', 'key'])
})

test('two with the same name in a list: the second takes 2, the third 3, the first keeps its own; a number already taken is passed over', () => {
  expect(numbered(['Apple', 'Google', 'Apple', 'Passkey', 'Passkey', 'Apple'])).toEqual(['Apple', 'Google', 'Apple 2', 'Passkey', 'Passkey 2', 'Apple 3'])
  expect(numbered(['Apple', 'Apple 2', 'Apple'])).toEqual(['Apple', 'Apple 2', 'Apple 3'])
})

test("what the device kept before it kept makers, a manager's full name, alone or with This device, reads as its maker; a name the person gave stays theirs", () => {
  expect([makerBefore('Google Password Manager'), makerBefore('iCloud Keychain'), makerBefore('Windows Hello'), makerBefore('Proton Pass'), makerBefore('Work phone')]).toEqual(['Google', 'Apple', 'Microsoft', 'Proton', undefined])
  localStorage.setItem('forest.backups', JSON.stringify({ first: { name: 'iCloud Keychain', here: true }, b: 'Google Password Manager', c: { name: 'Samsung Pass' }, d: { maker: 'Apple', name: 'Windows Hello' }, e: { name: 'Work phone' } }))
  expect(device.madeHere()).toEqual({ first: { maker: 'Apple' }, b: { maker: 'Google' }, c: { maker: 'Samsung' }, d: { maker: 'Apple', name: 'Windows Hello' }, e: { name: 'Work phone' } })
})

test("renamed on this device: kept beside its maker; its maker's name, or nothing, takes its own name back; one with no maker given Passkey again is forgotten", () => {
  device.noteMade('a', { maker: 'Google' })
  device.nameMade('a', '  Laptop  ')
  device.nameMade('z', 'Security key')
  expect(device.madeHere()).toEqual({ a: { maker: 'Google', name: 'Laptop' }, z: { name: 'Security key' } })
  device.nameMade('a', 'Google')
  device.nameMade('z', 'Passkey')
  expect(device.madeHere()).toEqual({ a: { maker: 'Google' } })
  device.nameMade('a', '')
  expect(device.madeHere()).toEqual({ a: { maker: 'Google' } })
})
