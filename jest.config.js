module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // testMatch: ['**/+(*.)+(spec).+(ts)'],
  // transform: {
  //   '^.+\\.(ts|js|html)$': 'jest-preset-angular',
  // },
  // moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  // testEnvironment: 'jsdom'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
