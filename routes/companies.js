"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema"); // Library for validating JSON schema
const express = require("express"); // Express framework for handling HTTP requests

const { BadRequestError } = require("../expressError"); // Custom error class for handling bad requests
const { ensureAdmin } = require("../middleware/auth"); // Middleware to ensure the user is an admin
const Company = require("../models/company"); // Company model for interacting with the companies table in the database

const companyNewSchema = require("../schemas/companyNew.json"); // Schema for validating new company creation
const companyUpdateSchema = require("../schemas/companyUpdate.json"); // Schema for validating company updates
const companySearchSchema = require("../schemas/companySearch.json"); // Schema for validating company search filters

const router = new express.Router(); // Create a new Express router instance


/** 
 * POST / { company } =>  { company }
 * 
 * Creates a new company. Requires the following fields:
 *   - handle, name, description, numEmployees, logoUrl
 * 
 * Returns the created company:
 *   { handle, name, description, numEmployees, logoUrl }
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const company = await Company.create(req.body); // Create a new company in the database
    return res.status(201).json({ company }); // Return the created company
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET / => 
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 * 
 * Retrieves a list of companies. Can accept search filters as query parameters:
 *   - minEmployees: filter companies with employees >= this value
 *   - maxEmployees: filter companies with employees <= this value
 *   - nameLike: partial, case-insensitive match on company names
 * 
 * Returns an array of companies matching the criteria.
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  const q = req.query;
  // Convert query parameters to appropriate types
  if (q.minEmployees !== undefined) q.minEmployees = +q.minEmployees;
  if (q.maxEmployees !== undefined) q.maxEmployees = +q.maxEmployees;

  try {
    const validator = jsonschema.validate(q, companySearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const companies = await Company.findAll(q); // Find companies with the specified filters
    return res.json({ companies }); // Return the list of companies
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /[handle] => { company }
 * 
 * Retrieves detailed information about a specific company. Returns:
 *   - handle, name, description, numEmployees, logoUrl
 *   - jobs: array of jobs at the company with { id, title, salary, equity }
 * 
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle); // Fetch company details by handle
    return res.json({ company }); // Return the company details
  } catch (err) {
    return next(err);
  }
});

/** 
 * PATCH /[handle] { fld1, fld2, ... } => { company }
 * 
 * Updates details of an existing company. Updatable fields include:
 *   - name, description, numEmployees, logo_url
 * 
 * Returns the updated company:
 *   { handle, name, description, numEmployees, logo_url }
 * 
 * Authorization required: admin
 */
router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs); // Throws a 400 error if validation fails
    }

    const company = await Company.update(req.params.handle, req.body); // Update the company in the database
    return res.json({ company }); // Return the updated company
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /[handle]  =>  { deleted: handle }
 * 
 * Deletes a company from the database.
 * 
 * Returns the handle of the deleted company.
 * 
 * Authorization required: admin
 */
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle); // Remove the company by handle
    return res.json({ deleted: req.params.handle }); // Return the deleted company handle
  } catch (err) {
    return next(err);
  }
});

module.exports = router; // Export the router for use in the app
