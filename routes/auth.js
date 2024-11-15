"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema"); // For validating request bodies against JSON schema
const User = require("../models/user"); // User model to interact with the database
const express = require("express"); // Express framework for routing
const router = new express.Router(); // Create a new router instance
const { createToken } = require("../helpers/tokens"); // Helper function to create JWT tokens
const userAuthSchema = require("../schemas/userAuth.json"); // JSON schema for user authentication request validation
const userRegisterSchema = require("../schemas/userRegister.json"); // JSON schema for user registration request validation
const { BadRequestError } = require("../expressError"); // Custom error class for bad requests

/** 
 * POST /auth/token:  { username, password } => { token }
 * 
 * Authenticates the user based on the provided username and password.
 * Returns a JWT token that can be used for authenticating further requests.
 * 
 * Authorization required: none
 */
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema); // Validate incoming request body
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack); // Collect all validation errors
      throw new BadRequestError(errs); // Throw error if validation fails
    }

    const { username, password } = req.body; // Extract username and password
    const user = await User.authenticate(username, password); // Authenticate the user
    const token = createToken(user); // Create a JWT token for the authenticated user
    return res.json({ token }); // Return the token as a response
  } catch (err) {
    return next(err); // Pass any error to the error-handling middleware
  }
});

/** 
 * POST /auth/register:   { user } => { token }
 * 
 * Registers a new user with the provided details. The request body must include:
 *   - username, password, firstName, lastName, email
 * 
 * Returns a JWT token that can be used for authenticating further requests.
 * 
 * Authorization required: none
 */
router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema); // Validate incoming request body
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack); // Collect validation errors
      throw new BadRequestError(errs); // Throw error if validation fails
    }

    const newUser = await User.register({ ...req.body, isAdmin: false }); // Register a new user (default isAdmin: false)
    const token = createToken(newUser); // Create a JWT token for the newly registered user
    return res.status(201).json({ token }); // Return the token with a 201 (Created) status
  } catch (err) {
    return next(err); // Pass any error to the error-handling middleware
  }
});

module.exports = router; // Export the router for use in the app
