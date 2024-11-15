// middleware/ensureAdmin.js
"use strict";

const { UnauthorizedError } = require("../expressError");

/**
 * Middleware to ensure user is an admin
 */
function ensureAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "You must be an admin to perform this action."});
    }
    return next();
}

module.exports = ensureAdmin;