// What Start and Add a backup say of the browser and the password manager: an app's own browser,
// where a passkey can't work (Passkeys don't work here), by its user agent; and where a maker keeps
// its passkeys, as Add a backup names it ("Not in Apple Passwords").

import { expect, test } from 'vitest'

import { managerOf } from '../src/managers.ts'
import { inAppBrowser } from '../src/passkey.ts'

test("an app's own browser, by its user agent: Instagram's, Facebook's, TikTok's, LinkedIn's, Snapchat's; never a browser's own", () => {
  const inside = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/480.0.0.0]',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0;]',
    'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36 trill_370000 BytedanceWebview/d8a21c6',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_37.0.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/13.20.0.43',
  ]
  for (const agent of inside) expect(inAppBrowser(agent), agent).toBe(true)
  const browsers = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  ]
  for (const agent of browsers) expect(inAppBrowser(agent), agent).toBe(false)
})

test("where a maker keeps its passkeys: Apple's in Apple Passwords, Google's in Google Password Manager, any other by its own name", () => {
  expect(['Apple', 'Google', '1Password', 'Microsoft'].map(managerOf)).toEqual(['Apple Passwords', 'Google Password Manager', '1Password', 'Microsoft'])
})
