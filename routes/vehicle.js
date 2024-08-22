const axios = require('axios');
const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();

const decodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
});

app.get('/vehicles/decode/:vin', decodeLimiter, async (req, res) => {
  const vin = req.params.vin;
  
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return res.status(400).json({ error: 'Invalid VIN format' });
  }

  try {
    const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const { Results } = response.data;

    const vehicleDetails = {
      manufacturer: Results.find(r => r.Variable === 'Manufacturer Name')?.Value,
      model: Results.find(r => r.Variable === 'Model')?.Value,
      year: Results.find(r => r.Variable === 'Model Year')?.Value,
    };

    res.json(vehicleDetails);
  } catch (error) {
    res.status(500).json({ error: 'Error decoding VIN' });
  }
});


app.post('/vehicles', async (req, res) => {
    const { vin, org } = req.body;
  
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return res.status(400).json({ error: 'Invalid VIN format' });
    }
  
    const orgExists = await Org.findById(org);
    if (!orgExists) {
      return res.status(400).json({ error: 'Organization not found' });
    }
  
    try {
      const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      const { Results } = response.data;
  
      const vehicleDetails = {
        vin,
        manufacturer: Results.find(r => r.Variable === 'Manufacturer Name')?.Value,
        model: Results.find(r => r.Variable === 'Model')?.Value,
        year: Results.find(r => r.Variable === 'Model Year')?.Value,
        org: orgExists._id,
      };
  
      const vehicle = new Vehicle(vehicleDetails);
      await vehicle.save();
  
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: 'Error decoding VIN or saving vehicle' });
    }
  });

app.get('/vehicles/:vin', async (req, res) => {
    const vin = req.params.vin;
  
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return res.status(400).json({ error: 'Invalid VIN format' });
    }
  
    try {
      const vehicle = await Vehicle.findOne({ vin }).populate('org');
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
  
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching vehicle' });
    }
});

app.post('/orgs', async (req, res) => {
    const { name, account, website, fuelReimbursementPolicy = 1000, speedLimitPolicy, parentOrg } = req.body;
  
    try {
      const org = new Org({
        name,
        account,
        website,
        fuelReimbursementPolicy,
        speedLimitPolicy,
        parentOrg,
      });
  
      if (parentOrg) {
        const parent = await Org.findById(parentOrg);
        if (parent) {
          org.fuelReimbursementPolicy = parent.fuelReimbursementPolicy;
          parent.childrenOrgs.push(org._id);
          await parent.save();
        } else {
          return res.status(400).json({ error: 'Parent organization not found' });
        }
      }
  
      await org.save();
      res.status(201).json(org);
    } catch (error) {
      res.status(500).json({ error: 'Error creating organization' });
    }
});

//upda
app.patch('/orgs/:id', async (req, res) => {
    const { id } = req.params;
    const { account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;
  
    try {
      const org = await Org.findById(id).populate('parentOrg');
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }
  
      if (account) org.account = account;
      if (website) org.website = website;
  
      if (fuelReimbursementPolicy !== undefined) {
        if (org.parentOrg) {
          return res.status(400).json({ error: 'Cannot update inherited fuel reimbursement policy' });
        } else {
          org.fuelReimbursementPolicy = fuelReimbursementPolicy;
        }
      }
  
      if (speedLimitPolicy !== undefined) {
        org.speedLimitPolicy = speedLimitPolicy;
      }
  
      await org.save();
  
      // Propagate policies to children if necessary
      if (fuelReimbursementPolicy !== undefined) {
        const updateChildrenPolicies = async (parentOrg) => {
          const children = await Org.find({ parentOrg: parentOrg._id });
          for (const child of children) {
            child.fuelReimbursementPolicy = fuelReimbursementPolicy;
            await child.save();
            await updateChildrenPolicies(child);
          }
        };
        await updateChildrenPolicies(org);
      }
  
      res.json(org);
    } catch (error) {
      res.status(500).json({ error: 'Error updating organization' });
    }
});
  
  
  
  