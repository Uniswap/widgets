if (typeof global.process !== 'object') {
  // WCv2 alters global.process, and other libs (eg jotai) depend on a static object.
  // Avoid breaking jotai by setting it statically before it is first seen.
  global.process = { env: {} } as any
}

export {}
