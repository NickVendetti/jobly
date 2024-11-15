"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema"); // Library for validating JSON schema
const express = require("express"); // Express framework for handling HTTP requests
const { BadRequestError } = require("../expressError"); // Custom error class for handling bad requests
const { ensureAdmin } = require("../middleware/auth"); // Middleware to ensure the user is an admin
const Job = require("../models/job"); // Job model for interacting with the jobs table in the database
const jobNewSchema = require("../schemas/jobNew.json"); // Schema for validating new job creation
const jobUpdateSchema = require("../schemas/jobUpdate.json"); // Schema for validating job updates
const jobSearchSchema = require("../schemas/jobSearch.json"); // Schema for validating job search filters

const router = express.Router({ mergeParams: true }); // Create a new Express router instance

/** 
 * POST / { job } => { job }
 * 
 * Creates a new job. Requires the following fields:
 *   - title, salary, equity, companyHandle
 * 
 * Returns the created job: 
 *   { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const job = await Job.create(req.body); // Create a new job in the database
    return res.status(201).json({ job }); // Return the created job
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET / => { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 * 
 * Retrieves a list of jobs. Can accept search filters as query parameters:
 *   - minSalary: filter jobs with a salary >= this value
 *   - hasEquity: true returns only jobs with equity > 0
 *   - title: partial case-insensitive match on the job title
 * 
 * Returns an array of jobs matching the criteria.
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  const q = req.query;
  // Convert query parameters to appropriate types
  if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
  q.hasEquity = q.hasEquity === "true";

  try {
    const validator = jsonschema.validate(q, jobSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const jobs = await Job.findAll(q); // Find jobs with the specified filters
    return res.json({ jobs }); // Return the list of jobs
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /[jobId] => { job }
 * 
 * Retrieves detailed information about a specific job, including:
 *   - id, title, salary, equity, company
 * Where `company` includes:
 *   - handle, name, description, numEmployees, logoUrl
 * 
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id); // Fetch job details by ID
    return res.json({ job }); // Return the job details
  } catch (err) {
    return next(err);
  }
});

/** 
 * PATCH /[jobId]  { fld1, fld2, ... } => { job }
 * 
 * Updates details of an existing job. Updatable fields include:
 *   - title, salary, equity
 * 
 * Returns the updated job:
 *   { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const job = await Job.update(req.params.id, req.body); // Update the job in the database
    return res.json({ job }); // Return the updated job
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /[jobId]  =>  { deleted: id }
 * 
 * Deletes a job from the database.
 * 
 * Returns the ID of the deleted job.
 * 
 * Authorization required: admin
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id); // Remove the job by ID
    return res.json({ deleted: +req.params.id }); // Return the deleted job ID
  } catch (err) {
    return next(err);
  }
});

module.exports = router; // Export the router for use in the app