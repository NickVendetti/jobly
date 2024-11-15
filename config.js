"use strict";

/** Shared config for application; can be required many places. */

// Load environment variables from a `.env` file into `process.env`.
require("dotenv").config();

// Import `colors` for colorful console output (useful for debugging or logging).
require("colors");

// Set the application's secret key, prioritizing the value from the environment variable,
// and defaulting to "secret-dev" for development use if not provided.
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// Set the application port. Convert the environment variable to a number (if defined),
// otherwise default to 3001.
const PORT = +process.env.PORT || 3001;

// Determine the appropriate database URI based on the environment.
// - Use the test database if `NODE_ENV` is "test".
// - Otherwise, use the `DATABASE_URL` environment variable if defined,
//   or default to the development database URI.
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
    ? "postgresql:///jobly_test"
    : process.env.DATABASE_URL || "postgresql:///jobly";
}

// Set the bcrypt work factor (algorithm complexity) based on the environment.
// - Use a lower work factor of 1 in the test environment to speed up tests.
// - Default to a work factor of 12 in non-test environments.
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// Log the application's configuration for debugging purposes.
// Use colors to make the log more readable.
console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

// Export the configuration variables and functions for use in other parts of the application.
module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};