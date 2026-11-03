// How an entry's values read on screen, by their type (the markets manual's Types): a choice in
// words, money as an amount, a place as its area or Online, a moment as a date and time, hours as
// days and times; and a post's preview, the fields its market shows first. A contact opens with a
// tap when it is a phone number, an email or a link.

import type { Body } from '@foundationforest/folders'

import type { Field, Market } from './markets.ts'
import { previewOf } from './markets.ts'

/** A choice's value in words: `new-with-tags` is New with tags. */
export const valueWords = (value: string) => {
  const words = value.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** A moment's time, in the device's words for it. */
const when = (time: unknown) => (typeof time === 'string' && !Number.isNaN(Date.parse(time)) ? new Date(time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '')

/** A field's value as one line, or empty when there is nothing to show. */
export function valueText(field: Field, value: unknown): string {
  if (value === undefined || value === null) return ''
  switch (field.type) {
    case 'choice':
      return (Array.isArray(value) ? value : [value]).map((v) => valueWords(String(v))).join(', ')
    case 'words':
      return Array.isArray(value) ? value.join(', ') : ''
    case 'money':
      return isObject(value) ? `${value.amount} ${value.currency}${value.per ? ` per ${value.per}` : ''}` : ''
    case 'place':
      if (!isObject(value)) return ''
      return [value.area, value.online ? 'Online' : ''].filter(Boolean).join(' · ')
    case 'moment':
      return isObject(value) ? `${when(value.from)} to ${when(value.to)}` : when(value)
    case 'hours':
      if (!isObject(value) || !Array.isArray(value.slots)) return ''
      return value.slots
        .filter(isObject)
        .map((slot) => `${[...(slot.days as string[])].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).map((d) => valueWords(d).slice(0, 3)).join(' ')} ${slot.from}–${slot.to}`)
        .join(', ')
    case 'file':
      return ''
    default:
      return String(value)
  }
}

/** A post's preview: the fields its market shows first, those it has, in one line each. */
export function previewLines(market: Market, body: Body): string[] {
  return previewOf(market)
    .map((name) => (market.post[name] ? valueText(market.post[name], body[name]) : ''))
    .filter(Boolean)
}

/** Where a contact opens with a tap: a phone number, an email, or a link. Undefined for anything else, a handle, which shows as it is. */
export function contactHref(contact: string): string | undefined {
  const text = contact.trim()
  if (/^https?:\/\/\S+$/i.test(text)) return text
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`
  if (/^\+?[\d\s().-]{6,}$/.test(text) && (text.match(/\d/g) ?? []).length >= 6) return `tel:${text.replace(/[^\d+]/g, '')}`
  return undefined
}

/** A rating as the index gives it, from 1 to 10, to one decimal: 9.4. */
export const ratingText = (rating: number) => rating.toFixed(1)

/** How many reviews: 1 review, 12 reviews. */
export const reviewCount = (n: number) => `${n} review${n === 1 ? '' : 's'}`
