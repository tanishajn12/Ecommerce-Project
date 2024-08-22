const Org = require('./models/Org');
const rateLimit = require('express-rate-limit');

// Middleware to ensure inheritance logic is applied on organization creation and update
const applyInheritance = async (req, res, next) => {
    const { parent, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

    if (parent) {
        try {
            const parentOrg = await Org.findById(parent);
            if (!parentOrg) {
                return res.status(400).json({ error: 'Invalid parent organization' });
            }

            // Inherit policies if they are not explicitly set
            req.body.fuelReimbursementPolicy = fuelReimbursementPolicy !== undefined ? fuelReimbursementPolicy : parentOrg.fuelReimbursementPolicy;
            req.body.speedLimitPolicy = speedLimitPolicy !== undefined ? speedLimitPolicy : parentOrg.speedLimitPolicy;
        } catch (error) {
            return res.status(500).json({ error: 'Error retrieving parent organization' });
        }
    }

    next();
};

// Middleware to propagate policy updates to children
const propagatePolicyUpdates = async (req, res, next) => {
    const { fuelReimbursementPolicy, speedLimitPolicy } = req.body;
    const orgId = req.params.id || req.body.id;

    if (!orgId) return next();

    try {
        const org = await Org.findById(orgId).populate('children');
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Handle fuelReimbursementPolicy inheritance
        if (fuelReimbursementPolicy !== undefined) {
            const childrenToUpdate = await Org.find({ parent: orgId });
            await Promise.all(childrenToUpdate.map(async (child) => {
                await Org.findByIdAndUpdate(child._id, { fuelReimbursementPolicy });
                await propagatePolicyUpdates({ body: { fuelReimbursementPolicy }, params: { id: child._id } }, res, next);
            }));
        }

        // Handle speedLimitPolicy inheritance
        if (speedLimitPolicy !== undefined) {
            const childrenToUpdate = await Org.find({ parent: orgId });
            await Promise.all(childrenToUpdate.map(async (child) => {
                await Org.findByIdAndUpdate(child._id, { speedLimitPolicy });
                await propagatePolicyUpdates({ body: { speedLimitPolicy }, params: { id: child._id } }, res, next);
            }));
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error propagating policy updates' });
    }

    next();
};

// Middleware to limit VIN decoding requests to 5 per minute
const decodeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
});

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
    },
    applyInheritance,
    propagatePolicyUpdates,
    decodeLimiter
};
