// A number's unit in words, as the screens say it beside the number (the markets manual's Units):
// one or many as the number says (1 night, 3 nights). Its own module, with no imports, so the
// browser test says it the same way.

/**
 * The units the app has words for, each as one and as many: 1 person, 4 people. A unit the markets
 * add later reads as its own name, hyphens as spaces, one or many (3 square metres): adding a unit
 * only grows the markets, so one the app doesn't know yet never stops it.
 */
const UNIT_WORDS: Record<string, [one: string, many: string]> = {
  seconds: ['second', 'seconds'],
  minutes: ['minute', 'minutes'],
  hours: ['hour', 'hours'],
  days: ['day', 'days'],
  years: ['year', 'years'],
  nights: ['night', 'nights'],
  centimetres: ['centimetre', 'centimetres'],
  metres: ['metre', 'metres'],
  kilometres: ['kilometre', 'kilometres'],
  'square-metres': ['square metre', 'square metres'],
  grams: ['gram', 'grams'],
  kilograms: ['kilogram', 'kilograms'],
  people: ['person', 'people'],
  rooms: ['room', 'rooms'],
}

/** A unit in words for `value`: one when it is 1 (1 night), else many (3 nights, and before anything is typed). */
export function unitWords(unit: string, value?: unknown): string {
  const [one, many] = Object.hasOwn(UNIT_WORDS, unit) ? UNIT_WORDS[unit]! : [unit.replaceAll('-', ' '), unit.replaceAll('-', ' ')]
  return typeof value === 'string' && value.trim() !== '' && Number(value) === 1 ? one : many
}
