require("dotenv").config();

// Ensure set node environment to test (jest does this if it's not set to something else)
process.env = { ...process.env, NODE_ENV: "test" };

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest",
  },
};
