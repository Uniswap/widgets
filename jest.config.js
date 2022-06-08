module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '.scss$': '<rootDir>/test/scssStub',
    '.(png|svg)$': '<rootDir>/test/imageStub',

    // Jest does not always resolve src/test (probably because of babel's TypeScript transpilation):
    '^test/*': '<rootDir>/src/test',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
}
