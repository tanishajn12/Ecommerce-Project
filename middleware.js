

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
};

const Org = require('../models/Org');

// Middleware to ensure inheritance logic is applied on organization creation and update
const applyInheritance = async (req, res, next) => {
    const { parent, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

    if (parent) {
        const parentOrg = await Org.findById(parent);
        if (!parentOrg) {
            return res.status(400).json({ error: 'Invalid parent organization' });
        }

        // Inherit policies if they are not explicitly set
        if (fuelReimbursementPolicy === undefined) {
            req.body.fuelReimbursementPolicy = parentOrg.fuelReimbursementPolicy;
        }
        if (speedLimitPolicy === undefined) {
            req.body.speedLimitPolicy = parentOrg.speedLimitPolicy;
        }
    }

    next();
};

// Middleware to propagate policy updates to children
const propagatePolicyUpdates = async (req, res, next) => {
    const { fuelReimbursementPolicy, speedLimitPolicy } = req.body;
    const orgId = req.params.id || req.body.id;

    if (!orgId) return next();

    const org = await Org.findById(orgId).populate('children');
    if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
    }

    // Handle fuelReimbursementPolicy inheritance
    if (fuelReimbursementPolicy !== undefined) {
        const childrenToUpdate = await Org.find({ parent: orgId });
        childrenToUpdate.forEach(async (child) => {
            await Org.findByIdAndUpdate(child._id, { fuelReimbursementPolicy });
            await propagatePolicyUpdates({ body: { fuelReimbursementPolicy }, params: { id: child._id } }, res, next);
        });
    }

    // Handle speedLimitPolicy inheritance
    if (speedLimitPolicy !== undefined) {
        const childrenToUpdate = await Org.find({ parent: orgId, speedLimitPolicy: org.speedLimitPolicy });
        childrenToUpdate.forEach(async (child) => {
            await Org.findByIdAndUpdate(child._id, { speedLimitPolicy });
            await propagatePolicyUpdates({ body: { speedLimitPolicy }, params: { id: child._id } }, res, next);
        });
    }

    next();
};

const rateLimit = require('express-rate-limit');

// Middleware to limit VIN decoding requests to 5 per minute
const decodeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
});




module.exports = {
    applyInheritance,
    propagatePolicyUpdates,
    decodeLimiter };


