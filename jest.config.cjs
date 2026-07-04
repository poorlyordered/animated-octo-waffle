/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  maxWorkers: 2,
  moduleNameMapper: {
    '^@lgriffin/esi\\.ts$': '<rootDir>/node_modules/@lgriffin/esi.ts/dist/index.js',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  roots: ['<rootDir>/apps/web/tests/contract', '<rootDir>/apps/web/tests/unit'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/apps/web/tsconfig.json',
        useESM: true
      }
    ]
  }
};
