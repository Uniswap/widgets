module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '.scss$': '<rootDir>/test/scssStub',
    '.(png|svg)$': '<rootDir>/test/imageStub',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
}
