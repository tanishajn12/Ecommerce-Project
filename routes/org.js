const express = require('express');
const router = express.Router();
const Org = require('../models/Org');

// POST /orgs
// Creates a new organization with default policies if not provided.
router.post('/', async (req, res) => {
    const { name, account, website, fuelReimbursementPolicy = 1000, speedLimitPolicy = 25 } = req.body;

    try {
        const newOrg = new Org({
            name,
            account,
            website,
            fuelReimbursementPolicy,
            speedLimitPolicy,
        });

        await newOrg.save();

        // Respond with the created organization's details
        res.status(201).json(newOrg);
    } catch (error) {
        res.status(400).json({ error: 'Error creating organization' });
    }
});

// PATCH /orgs/:id
// Updates an existing organization's details.
router.patch('/:id', async (req, res) => {
    const { fuelReimbursementPolicy, speedLimitPolicy, ...rest } = req.body;

    try {
        const org = await Org.findById(req.params.id);

        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Inheritance rules: 
        // 1. Update policies based on inheritance logic.
        if (fuelReimbursementPolicy !== undefined) {
            org.fuelReimbursementPolicy = fuelReimbursementPolicy;
            // Propagate to children
        }

        if (speedLimitPolicy !== undefined) {
            org.speedLimitPolicy = speedLimitPolicy;
            // Propagate to children
        }

        // Update other fields
        Object.assign(org, rest);

        await org.save();

        // Respond with the updated organization's details
        res.json(org);
    } catch (error) {
        res.status(400).json({ error: 'Error updating organization' });
    }
});

// GET /orgs
// Retrieves all organizations with details and policies.
router.get('/', async (req, res) => {
    try {
        const orgs = await Org.find();

        // Implement pagination if needed
        res.json(orgs);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching organizations' });
    }
});

module.exports = router;
