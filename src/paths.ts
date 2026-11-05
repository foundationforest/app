// Each screen the person can come back to, by its own path, so a reload opens on it and the phone's
// back goes back (App.tsx); every other screen is at the page's root, but Didit's way back, /back.
// A module of its own, so a test reads the paths without the screens.

export const PATHS = {
  verify: '/id',
  new: '/new',
  profile: '/profile',
  'profile-feedback': '/profile-feedback',
  received: '/received',
  listing: '/listing',
  review: '/review',
  notifications: '/notifications',
  messages: '/messages',
  thread: '/thread',
  message: '/message',
  settings: '/settings',
  connect: '/connect',
  'connect-ai': '/connect-ai',
  ai: '/ai',
  'add-passkey': '/passkey',
  words: '/words',
} as const
