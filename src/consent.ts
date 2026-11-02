// What the ID check keeps and who keeps it, shown before it starts, word for word as the verifier
// states it (services' verifier/README.md, The consent screen, at SERVICES): test/build.test.ts holds
// it to that text.

export const CONSENT =
  'The check costs $5, paid to the Open Forest Foundation through Stripe, and covers up to three tries. Stripe keeps your payment details and email; Forest keeps of the payment only a one-way hash and how it was used, never beside your stamp. Forest, run by the Open Forest Foundation, checks your face and a government ID with Didit, its provider, to make sure each person is checked once. Didit keeps photos of your ID and what it reads on it (your name, date of birth and document number), your selfie and a short video while it checks. An hour after your stamp is signed, Forest deletes them at Didit, which keeps only a template of your face, for up to ten years, so it can tell if the same face comes back. Forest keeps none of this: only a one-way fingerprint of your name and date of birth next to your stamp number, so the same person is not checked twice, and the stamp it signed you, a one-way hash of what the check saw, so it can hand it back if you lose it. It gives you a stamp, with your name, date of birth and country beside it for your own records; a profile that shows it says only that you were checked.'

/** While the verifier's Stripe key is a test one (a payment id `cs_test_…`), the card that pays: Stripe's test card. */
export const TEST_CARD = 'Test mode: pay with the card 4242 4242 4242 4242.'
