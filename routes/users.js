"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema"); // For validating request bodies against JSON schemas

const express = require("express"); // Express framework for handling HTTP requests
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth"); // Middleware for authorization checks
const { BadRequestError } = require("../expressError"); // Custom error handling
const User = require("../models/user"); // User model for database interactions
const { createToken } = require("../helpers/tokens"); // Helper function for generating authentication tokens
const userNewSchema = require("../schemas/userNew.json"); // Schema for validating new user creation
const userUpdateSchema = require("../schemas/userUpdate.json"); // Schema for validating user updates

const router = express.Router(); // Create a new Express router instance

/** 
 * POST / { user }  => { user, token }
 * 
 * Adds a new user to the system. Only accessible to admin users.
 * - Validates the request body against `userNewSchema`.
 * - If successful, registers the user and generates an authentication token for them.
 * - Returns the new user and their token.
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const user = await User.register(req.body); // Register the new user
    const token = createToken(user); // Generate an auth token for the user
    return res.status(201).json({ user, token }); // Respond with the created user and token
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * 
 * Returns a list of all users in the system.
 * 
 * Authorization required: admin
 */
router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll(); // Fetch all users from the database
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /[username] => { user }
 * 
 * Returns detailed information about a specific user, including:
 *   - username, firstName, lastName, isAdmin
 *   - jobs: { id, title, companyHandle, companyName, state }
 * 
 * Authorization required: admin or same user as the requested username
 */
router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username); // Fetch user details by username
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** 
 * PATCH /[username] { user } => { user }
 * 
 * Updates a user's information. Fields that can be updated include:
 *   - firstName, lastName, password, email
 * - Validates the request body against `userUpdateSchema`.
 * - Returns the updated user information.
 * 
 * Authorization required: admin or same user as the requested username
 */
router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const user = await User.update(req.params.username, req.body); // Update user in the database
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /[username]  =>  { deleted: username }
 * 
 * Deletes a user from the system.
 * 
 * Authorization required: admin or same user as the requested username
 */
router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username); // Remove user by username
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** 
 * POST /[username]/jobs/[id]  { state } => { application }
 * 
 * Allows a user to apply to a job.
 * - Adds the job application to the database.
 * - Returns: { "applied": jobId }
 * 
 * Authorization required: admin or same user as the requested username
 */
router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const jobId = +req.params.id; // Parse job ID as a number
    await User.applyToJob(req.params.username, jobId); // Add job application
    return res.json({ applied: jobId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router; // Export the router for use in the app