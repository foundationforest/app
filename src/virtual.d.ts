declare module 'virtual:markets' {
  const directory: import('@foundationforest/markets').Directory
  export default directory
}

/** The commit the build was made from, its first seven characters (build/version.ts). */
declare const __COMMIT__: string
