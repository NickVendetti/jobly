"use strict";

// This test suite checks if the application's configuration correctly adapts to environment variables.
describe("config can come from env", function () {

  // This test validates that environment variables override default configuration values.
  test("works", function() {
    // Set environment variables to simulate different configurations.
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";

    // Dynamically import the config module after setting the environment variables.
    const config = require("./config");

    // Assertions to ensure the configuration values are correctly overridden by environment variables.
    expect(config.SECRET_KEY).toEqual("abc"); // The SECRET_KEY should now be "abc".
    expect(config.PORT).toEqual(5000); // The PORT should now be 5000.
    expect(config.getDatabaseUri()).toEqual("other"); // The database URI should be "other".
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12); // Default bcrypt work factor for non-test environments.

    // Clean up: remove the environment variables set earlier.
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    // Verify that without environment variables, the default database URI is used.
    expect(config.getDatabaseUri()).toEqual("postgresql:///jobly");

    // Simulate a test environment and check the corresponding database URI.
    process.env.NODE_ENV = "test";
    expect(config.getDatabaseUri()).toEqual("postgresql:///jobly_test");
  });
});