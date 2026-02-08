/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/index.ts"],
};
