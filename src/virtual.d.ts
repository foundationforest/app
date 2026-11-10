declare module 'virtual:markets' {
  /** The markets' files, as data (build/markets.ts). */
  const files: import('@foundationforest/markets/browser').Files
  export default files
}

/** This build's version: the commit it was built from, short, or "dev" where none is known (vite.config.ts). */
declare const __COMMIT__: string
