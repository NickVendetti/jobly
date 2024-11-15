const request = require("supertest"); // Import `supertest` to simulate HTTP requests for testing.

const app = require("./app"); // Import the application to test its routes and behavior.
const db = require("./db");   // Import the database connection for cleanup purposes.

/** Test case for a non-existent route, expecting a 404 response */
test("not found for site 404", async function () {
  // Simulate a GET request to a non-existent path "/no-such-path".
  const resp = await request(app).get("/no-such-path");

  // Verify that the response status code is 404 (Not Found).
  expect(resp.statusCode).toEqual(404);
});

/** Test case for a 404 response with stack trace handling */
test("not found for site 404 (test stack print)", async function () {
  // Temporarily clear the `NODE_ENV` environment variable to simulate a non-test environment.
  process.env.NODE_ENV = "";

  // Simulate a GET request to a non-existent path "/no-such-path".
  const resp = await request(app).get("/no-such-path");

  // Verify that the response status code is still 404 (Not Found).
  expect(resp.statusCode).toEqual(404);

  // Restore the `NODE_ENV` variable to its original state.
  delete process.env.NODE_ENV;
});

/** Clean up: Close the database connection after all tests */
afterAll(function () {
  db.end(); // Close the database connection to free up resources.
});