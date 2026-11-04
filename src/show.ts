// How an entry's values read on screen, by their type (the markets manual's Types): a choice by its
// label where its field has one, else in words, money as people write a price, in the device's own
// number format ($20, €30 per hour), a place as its area and how far round it reaches, a moment as
// a date and time, hours as days and times; and a listing's preview, the fields its market shows
// first.
// A contact opens with a tap when it is a phone number, an email or a link.

import type { Body } from '@foundationforest/folders'

import type { Field, Market } from './markets.ts'
import { previewOf } from './markets.ts'

/** A value in words, hyphens as spaces and a capital first: `new-with-tags` is New with tags. */
export const valueWords = (value: string) => {
  const words = value.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A choice's value as people read it: its label where its field has one (`xl` is XL), else in words. */
export const choiceWords = (field: Pick<Field, 'labels'>, value: string) => (field.labels && Object.hasOwn(field.labels, value) ? field.labels[value]! : valueWords(value))

/** A place: its area, then how far round it reaches; nothing more for radius 0, that exact spot. An older place, with no radius, as its area. */
export function placeText(place: { area?: unknown; radiusKm?: unknown }): string {
  const area = typeof place.area === 'string' ? place.area : ''
  if (typeof place.radiusKm !== 'number') return area
  if (place.radiusKm === 0) return area || 'An exact spot'
  return area ? `${area}, within ${place.radiusKm} km` : `Within ${place.radiusKm} km`
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
      return (Array.isArray(value) ? value : [value]).map((v) => choiceWords(field, String(v))).join(', ')
    case 'words':
      return Array.isArray(value) ? value.join(', ') : ''
    case 'money':
      return isObject(value) ? priceText(value) : ''
    case 'place':
      return isObject(value) ? placeText(value) : ''
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

/**
 * A price as people write it, in the device's own number format (or `locale`'s): $20, $12.50, €30
 * per hour, 30 € per hour. An amount that is no number, or a currency that is no code, reads as it
 * was written: 30 coins.
 */
export function priceText(money: { amount?: unknown; currency?: unknown; per?: unknown }, locale?: string): string {
  const amount = Number(money.amount)
  let text = `${String(money.amount)} ${String(money.currency)}`
  if (typeof money.amount === 'string' && money.amount.trim() !== '' && Number.isFinite(amount)) {
    try {
      text = new Intl.NumberFormat(locale, { style: 'currency', currency: String(money.currency), trailingZeroDisplay: 'stripIfInteger' }).format(amount)
    } catch {
      // Not a currency code: as it was written.
    }
  }
  return typeof money.per === 'string' && money.per ? `${text} per ${money.per}` : text
}

/** A listing's preview: the fields its market shows first, those it has, in one line each. */
export function previewLines(market: Market, body: Body): string[] {
  return previewOf(market)
    .map((name) => (market.listing[name] ? valueText(market.listing[name], body[name]) : ''))
    .filter(Boolean)
}

/**
 * A listing's two lines on its row, in every market: with a price, the first of its preview's other
 * lines, then the price ($20, €30 per hour), wherever the market's preview puts it, or leaves it
 * out; with none, its preview's first two lines.
 */
export function rowLines(market: Market, body: Body): string[] {
  const price = market.listing.price ? valueText(market.listing.price, body.price) : ''
  const lines = previewOf(market)
    .filter((name) => name !== 'price')
    .map((name) => (market.listing[name] ? valueText(market.listing[name], body[name]) : ''))
    .filter(Boolean)
  return price ? [...lines.slice(0, 1), price] : lines.slice(0, 2)
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
