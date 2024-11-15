"use strict";

/** Express app for jobly. */

const express = require("express"); // Import Express framework.
const cors = require("cors"); // Import CORS to handle cross-origin requests.

const { NotFoundError } = require("./expressError"); // Custom error class for 404 errors.

const { authenticateJWT } = require("./middleware/auth"); // Middleware to authenticate JWTs.
const authRoutes = require("./routes/auth"); // Authentication-related routes.
const companiesRoutes = require("./routes/companies"); // Routes for companies-related endpoints.
const usersRoutes = require("./routes/users"); // Routes for users-related endpoints.
const jobsRoutes = require("./routes/jobs"); // Routes for jobs-related endpoints.

const morgan = require("morgan"); // Logging middleware.

const app = express(); // Initialize the Express application.

// Middleware to handle CORS, JSON parsing, request logging, and JWT authentication.
app.use(cors()); // Enable cross-origin requests.
app.use(express.json()); // Parse incoming JSON payloads.
app.use(morgan("tiny")); // Log HTTP requests in a concise format.
app.use(authenticateJWT); // Add JWT authentication to all routes.

// Route handlers for different endpoints.
app.use("/auth", authRoutes); // Routes for authentication (login, signup, etc.).
app.use("/companies", companiesRoutes); // Routes for managing companies.
app.use("/users", usersRoutes); // Routes for managing users.
app.use("/jobs", jobsRoutes); // Routes for managing jobs.

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  // If no route matches, pass a `NotFoundError` to the error handler.
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  // Log the error stack trace in non-test environments for debugging purposes.
  if (process.env.NODE_ENV !== "test") console.error(err.stack);

  // Extract the status code and message from the error (default to 500 if not set).
  const status = err.status || 500;
  const message = err.message;

  // Send a JSON response with the error details.
  return res.status(status).json({
    error: { message, status },
  });
});

// Export the app for use in other files or for testing purposes.
module.exports = app;