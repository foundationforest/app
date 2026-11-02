// A test that does not run is a failure: the browser test's run (node:test) ends with no test
// skipped and none marked to do, or this reporter makes it fail and names them.

type Event = { type: string; data: { name?: string; skip?: boolean | string; todo?: boolean | string } }

export default async function* noSkips(source: AsyncIterable<Event>): AsyncGenerator<string> {
  const skipped: string[] = []
  for await (const event of source) {
    if ((event.type === 'test:pass' || event.type === 'test:fail') && (event.data.skip !== undefined || event.data.todo !== undefined)) skipped.push(event.data.name ?? '?')
  }
  if (skipped.length) {
    process.exitCode = 1
    yield `${skipped.length} test(s) did not run, and a test that does not run fails: ${skipped.join(', ')}\n`
  }
}
