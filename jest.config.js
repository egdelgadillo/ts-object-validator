/**
 * Configure Jest for Typescript
 * Reference: https://dev.to/muhajirdev/unit-testing-with-typescript-and-jest-2gln
 */
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
