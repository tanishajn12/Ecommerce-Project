const express = require('express');
const router = express.Router();
const axios = require('axios');
const Vehicle = require('../models/Vehicle');
const Org = require('../models/Org');
const { decodeLimiter } = require('../middleware/rateLimiter'); // Middleware to limit requests

// In-memory cache for storing decoded VIN results
const cache = {};

// GET /vehicles/decode/:vin
// Decodes a vehicle's VIN using the NHTSA API and returns manufacturer, model, and year.
router.get('/decode/:vin', decodeLimiter, async (req, res) => {
    const vin = req.params.vin;

    // Validate the VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN format' });
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
        res.status(500).json({ error: 'Error decoding VIN' });
    }
});

// POST /vehicles
// Adds a new vehicle to the system, decoding its VIN and associating it with an organization.
router.post('/', async (req, res) => {
    const { vin, org } = req.body;

    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN format' });
    }

    // Validate organization ID
    const organization = await Org.findById(org);
    if (!organization) {
        return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Check if the vehicle already exists
    const existingVehicle = await Vehicle.findOne({ vin });
    if (existingVehicle) {
        return res.status(400).json({ error: 'Vehicle already exists' });
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

        // Respond with the created vehicle's details
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ error: 'Error adding vehicle' });
    }
});

// GET /vehicles/:vin
// Fetches the vehicle details for the given VIN.
router.get('/:vin', async (req, res) => {
    const vin = req.params.vin;

    // Validate the VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN format' });
    }

    try {
        const vehicle = await Vehicle.findOne({ vin }).populate('org', 'name');

        // Check if the vehicle exists
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        // Respond with the vehicle's details
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching vehicle' });
    }
});

module.exports = router;
