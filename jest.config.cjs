module.exports = {
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\.scss$': '<rootDir>/src/tests/scssStub',
    '\.(png|svg)$': '<rootDir>/src/tests/imageStub',
  },
}
