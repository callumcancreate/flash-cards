require("dotenv").config();
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest"
  }
};
