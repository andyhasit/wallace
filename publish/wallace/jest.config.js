module.exports = {
  "roots": [
    "./tests",
  ],
  "testEnvironment": "jsdom",
  "reporters": [
    "default",
    "jest-summary-reporter"
  ],
  "transform": {
    "\\.[jt]sx?$": "babel-jest",
  }
}
