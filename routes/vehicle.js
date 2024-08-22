const express = require('express');
const router = express.Router();
const axios = require('axios');
const Vehicle = require('../models/Vehicle');
const Org = require('../models/Org');
const { decodeLimiter } = require('../middleware'); // Middleware to limit API requests

// In-memory cache for decoded VIN results
const cache = {};

// GET /vehicles/decode/:vin
// Decodes a vehicle's VIN using the NHTSA API and returns manufacturer, model, and year.
router.get('/decode/:vin', decodeLimiter, async (req, res) => {
    const vin = req.params.vin;

    // Validate the VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).render('error', { error: 'Invalid VIN format' });
    }

    // Check if VIN is already cached
    if (cache[vin]) {
        return res.json(cache[vin]);
    }

    try {
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        const { Results } = response.data;

        const vehicleDetails = {
            manufacturer: Results.find(r => r.Variable === 'Manufacturer Name')?.Value,
            model: Results.find(r => r.Variable === 'Model')?.Value,
            year: Results.find(r => r.Variable === 'Model Year')?.Value,
        };

        // Cache the result
        cache[vin] = vehicleDetails;

        // Respond with vehicle details
        res.json(vehicleDetails);
    } catch (error) {
        res.status(500).render('error', { error: 'Error decoding VIN' });
    }
});

// GET /vehicles/new
// Displays the form to add a new vehicle
router.get('/new', async (req, res) => {
    try {
        // Fetch organizations to populate the form
        const orgs = await Org.find();
        res.render('vehicles/new', { orgs });
    } catch (error) {
        res.status(500).render('error', { error: 'Error fetching organizations' });
    }
});

// POST /vehicles
// Adds a new vehicle to the system, decoding its VIN and associating it with an organization.
router.post('/', async (req, res) => {
    const { vin, org } = req.body;

    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).render('error', { error: 'Invalid VIN format' });
    }

    // Validate organization ID
    const organization = await Org.findById(org);
    if (!organization) {
        return res.status(400).render('error', { error: 'Invalid organization ID' });
    }

    // Check if the vehicle already exists
    const existingVehicle = await Vehicle.findOne({ vin });
    if (existingVehicle) {
        return res.status(400).render('error', { error: 'Vehicle already exists' });
    }

    try {
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        const { Results } = response.data;

        const vehicleDetails = {
            vin,
            manufacturer: Results.find(r => r.Variable === 'Manufacturer Name')?.Value,
            model: Results.find(r => r.Variable === 'Model')?.Value,
            year: Results.find(r => r.Variable === 'Model Year')?.Value,
            org: organization._id,
        };

        // Save the vehicle to the database
        const newVehicle = new Vehicle(vehicleDetails);
        await newVehicle.save();

        // Redirect to the vehicle's details page
        res.redirect(`/vehicles/${vin}`);
    } catch (error) {
        res.status(500).render('error', { error: 'Error adding vehicle' });
    }
});

// GET /vehicles/:vin
// Fetches the vehicle details for the given VIN.
router.get('/:vin', async (req, res) => {
    const vin = req.params.vin;

    // Validate the VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).render('error', { error: 'Invalid VIN format' });
    }

    try {
        const vehicle = await Vehicle.findOne({ vin }).populate('org', 'name');

        // Check if the vehicle exists
        if (!vehicle) {
            return res.status(404).render('error', { error: 'Vehicle not found' });
        }

        // Respond with the vehicle's details
        res.render('vehicles/show', { vehicle });
    } catch (error) {
        res.status(500).render('error', { error: 'Error fetching vehicle' });
    }
});

// GET /vehicles/:vin/edit
// Displays the form to edit an existing vehicle
router.get('/:vin/edit', async (req, res) => {
    const vin = req.params.vin;

    // Validate the VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).render('error', { error: 'Invalid VIN format' });
    }

    try {
        const vehicle = await Vehicle.findOne({ vin });
        const orgs = await Org.find();

        // Check if the vehicle exists
        if (!vehicle) {
            return res.status(404).render('error', { error: 'Vehicle not found' });
        }

        res.render('vehicles/edit', { vehicle, orgs });
    } catch (error) {
        res.status(500).render('error', { error: 'Error fetching vehicle' });
    }
});

// PATCH /vehicles/:vin
// Updates an existing vehicle
router.patch('/:vin', async (req, res) => {
    const vin = req.params.vin;
    const { org } = req.body;

    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).render('error', { error: 'Invalid VIN format' });
    }

    // Validate organization ID
    const organization = await Org.findById(org);
    if (!organization) {
        return res.status(400).render('error', { error: 'Invalid organization ID' });
    }

    try {
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { vin },
            { org: organization._id },
            { new: true }
        );

        // Check if the vehicle exists
        if (!updatedVehicle) {
            return res.status(404).render('error', { error: 'Vehicle not found' });
        }

        // Redirect to the vehicle's details page
        res.redirect(`/vehicles/${vin}`);
    } catch (error) {
        res.status(500).render('error', { error: 'Error updating vehicle' });
    }
});

module.exports = router;
