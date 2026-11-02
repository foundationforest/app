// A test that does not run is a failure: Vitest's runs end with every test passed or failed, none
// skipped and none left to do, or this reporter makes the run fail and names them.

import type { Reporter, TestCase } from 'vitest/node'

export default class NoSkips implements Reporter {
  private readonly skipped: string[] = []

  onTestCaseResult(test: TestCase) {
    const state = test.result().state
    if (state === 'skipped' || state === 'pending') this.skipped.push(test.fullName)
  }

  onTestRunEnd() {
    if (!this.skipped.length) return
    console.error(`\n${this.skipped.length} test(s) did not run, and a test that does not run fails:\n${this.skipped.map((t) => `  ${t}`).join('\n')}`)
    process.exitCode = 1
  }
}
