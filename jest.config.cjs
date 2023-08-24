/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  moduleDirectories: ["node_modules", "src"],
  rootDir: "./",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
  },
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter", {
        "pageTitle": "Test Report",
        "outputPath": "./test-results/test-report.html",
      },
      "jest-junit" , {
        outputPath: "./test-results/junit.xml",
      }
    ]
  ]
  // clearMocks: true,
};