declare module 'virtual:markets' {
  /** The markets' files, as data (build/markets.ts). */
  const files: import('@foundationforest/markets/browser').Files
  export default files
}

/** The commit the build was made from, its first seven characters (build/version.ts). */
declare const __COMMIT__: string
