module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // testMatch: ['**/+(*.)+(spec).+(ts)'],
  // transform: {
  //   '^.+\\.(ts|js|html)$': 'jest-preset-angular',
  // },
  // moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  // testEnvironment: 'jsdom'
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
