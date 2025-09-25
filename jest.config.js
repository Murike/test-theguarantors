/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.(spec|test)\\.ts$',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
};
