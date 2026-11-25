// Each screen the person can come back to, by its own path, so a reload opens on it and the phone's
// back goes back (App.tsx); every other screen is at the page's root. A check never leaves the page
// (screens/CheckBox.tsx), so no path is a way back into it. A module of its own, so a test reads the
// paths without the screens.

export const PATHS = {
  verify: '/id',
  backup: '/backup',
  new: '/new',
  profile: '/profile',
  offer: '/offer',
  written: '/written',
  reviews: '/reviews',
  received: '/received',
  them: '/them',
  listing: '/listing',
  review: '/review',
  messages: '/messages',
  thread: '/thread',
  message: '/message',
  you: '/you',
  checks: '/checks',
  document: '/document',
  connect: '/connect',
  'connect-ai': '/connect-ai',
  passkeys: '/passkeys',
  'add-passkey': '/passkey',
  words: '/words',
  'ai-apps': '/ai-apps',
  email: '/email',
  about: '/about',
  data: '/data',
  privacy: '/privacy',
  terms: '/terms',
} as const
