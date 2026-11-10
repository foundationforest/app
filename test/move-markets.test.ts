// The description .github/markets.ts writes for the pull request that moves MARKETS and SERVICES
// (.github/workflows/markets.yml): services' own tests of its copy, and the line for SERVICES.

import { expect, test } from 'vitest'

import { commits, description, excerpt } from '../.github/markets.ts'

const A = 'a'.repeat(40)
const B = 'b'.repeat(40)
const C = 'c'.repeat(40)
const D = 'd'.repeat(40)
const RUN = 'https://github.com/foundationforest/app/actions/runs/1'
const MOVE = { from: A, to: B, servicesFrom: C, servicesTo: D, run: RUN }

test("a merge commit takes its pull request's title, a squash commit keeps its own", () => {
  const log =
    `${A}\nMerge pull request #29 from foundationforest/claude/x\n\nRename the post kind to listing\n\0` +
    `${B}\nSay what vouches are (#30)\n\0` +
    `${A}\nMerge pull request #31 from foundationforest/claude/y\n\0`
  expect(commits(log)).toEqual([
    `- [\`aaaaaaa\`](https://github.com/foundationforest/markets/commit/${A}) Rename the post kind to listing (foundationforest/markets#29)`,
    `- [\`bbbbbbb\`](https://github.com/foundationforest/markets/commit/${B}) Say what vouches are (foundationforest/markets#30)`,
    `- [\`aaaaaaa\`](https://github.com/foundationforest/markets/commit/${A}) Merge pull request foundationforest/markets#31 from foundationforest/claude/y`,
  ])
})

test('an @name in a title pings nobody, and an address or another repo is left as it is', () => {
  const [line] = commits(`${A}\nThanks @carlos, see a@b.org and foundationforest/standard#5\n`)
  expect(line).toMatch(/ Thanks `@carlos`, see a@b\.org and foundationforest\/standard#5$/)
})

const LOG = [
  '2026-11-10T12:41:00.0000000Z ##[group]Run actions/checkout@v7',
  '2026-11-10T12:41:01.0000000Z ##[endgroup]',
  '2026-11-10T12:41:02.0000000Z ##[group]Run npm test',
  '2026-11-10T12:41:02.0000000Z npm test',
  '2026-11-10T12:41:02.0000000Z ##[endgroup]',
  '2026-11-10T12:41:03.0000000Z \x1b[31m FAIL  test/flows.test.ts > a listing\x1b[39m',
  '2026-11-10T12:41:04.0000000Z ##[error]Process completed with exit code 1.',
  '2026-11-10T12:41:05.0000000Z Post job cleanup.',
].join('\n')

test("a failed job's excerpt is its failing step to its error, without times or colours", () => {
  expect(excerpt(LOG)).toBe(
    ['Run npm test', 'npm test', ' FAIL  test/flows.test.ts > a listing', 'Error: Process completed with exit code 1.'].join('\n'),
  )
})

test('an excerpt keeps the last 40 lines, each at most 200 characters, and a log with no error its end', () => {
  const long = Array.from({ length: 100 }, (_, i) => `line ${i} ${'x'.repeat(300)}`)
  const lines = excerpt(['##[group]Run npm test', ...long, '##[error]failed'].join('\n')).split('\n')
  expect(lines).toHaveLength(40)
  expect(lines.every((l) => l.length <= 201)).toBe(true)
  expect(lines.at(-1)).toBe('Error: failed')
  expect(excerpt('one\ntwo\n')).toBe('one\ntwo')
})

test('the description names both moves, and links the commits SERVICES brings in', () => {
  const text = description({ ...MOVE, commits: [] })
  expect(text).toMatch(
    /^Moves `MARKETS` from \[`aaaaaaa`\]\(https:\/\/github\.com\/foundationforest\/markets\/commit\/a{40}\) to \[`bbbbbbb`\]\(.+\), the markets' commit services' main runs, and `SERVICES` from \[`ccccccc`\]\(https:\/\/github\.com\/foundationforest\/services\/commit\/c{40}\) to \[`ddddddd`\]\(.+\), services' main/,
  )
  expect(text).toContain(`([its commits](https://github.com/foundationforest/services/compare/${C}...${D}))`)
})

test('the description says the checks passed, or holds each failed job in a fence longer than its backticks', () => {
  const lines = commits(`${B}\nSay what vouches are (#30)\n`)
  const passed = description({ ...MOVE, commits: lines })
  expect(passed).toContain(lines[0])
  expect(passed).toContain(`Every check passed against it in [this run](${RUN}).`)

  const log = '##[group]Run npm test\nexpected ```` here\n##[error]failed'
  const failed = description({ ...MOVE, commits: lines, failed: [{ job: 'app', log }] })
  expect(failed).toContain(`A check failed against it in [this run](${RUN}), so this stays open`)
  expect(failed).toContain("each day's run tries again with services' main.")
  expect(failed).toContain('### app\n\n`````\nRun npm test\nexpected ```` here\nError: failed\n`````')
  expect(failed).not.toContain('Every check passed')
})

test("the description stays within GitHub's limit when every job fails at length", () => {
  const huge = ['##[group]Run npm test', ...Array.from({ length: 500 }, () => 'y'.repeat(1000)), '##[error]x'].join('\n')
  const many = commits(Array.from({ length: 250 }, () => `${A}\n${'z'.repeat(1000)}\n`).join('\0'))
  const failed = Array.from({ length: 9 }, (_, i) => ({ job: `job ${i}`, log: huge }))
  const text = description({ ...MOVE, commits: many, failed })
  expect(text.length).toBeLessThanOrEqual(65_536)
  expect(text.endsWith(`the rest is in [the run](${RUN}).)\n`)).toBe(true)
})
