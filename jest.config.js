module.exports = {
  testEnvironment: 'hardhat/dist/jsdom',
  moduleNameMapper: {
    '.scss$': '<rootDir>/test/scssStub',
    '.(png|svg)$': '<rootDir>/test/imageStub',

    // Jest does not always resolve src/test (probably because of babel's TypeScript transpilation):
    '^test/*': '<rootDir>/src/test',

    'utils/conedison/format': 'utils/conedison/dist/format.js',
    'utils/conedison/provider': 'utils/conedison/dist/provider/index.js',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
  setupFilesAfterEnv: ['jest-extended/all', '<rootDir>/test/setup-jest.ts'],
}
