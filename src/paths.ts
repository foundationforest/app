// Each screen the person can come back to, by its own path, so a reload opens on it and the phone's
// back goes back (App.tsx); every other screen is at the page's root. Two more paths are ways back
// into the app, in the tab a check runs in: where Stripe sends the person after paying for the ID
// check, and where Didit sends them after a check. A module of its own, so a test reads the paths
// without the screens.

export const PATHS = {
  verify: '/id',
  new: '/new',
  profile: '/profile',
  reviews: '/reviews',
  received: '/received',
  them: '/them',
  listing: '/listing',
  review: '/review',
  notifications: '/notifications',
  messages: '/messages',
  thread: '/thread',
  message: '/message',
  you: '/you',
  connect: '/connect',
  'connect-ai': '/connect-ai',
  passkeys: '/passkeys',
  'add-passkey': '/passkey',
  words: '/words',
  'ai-apps': '/ai-apps',
  email: '/email',
  about: '/about',
} as const

/** Where Stripe sends the person back after paying, and Didit after a check: each opens Get verified, which goes on by itself. */
export const RETURNS = { paid: '/paid', checked: '/back' } as const
