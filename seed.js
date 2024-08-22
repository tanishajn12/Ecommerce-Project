const mongoose = require('mongoose');
const axios = require('axios');
const Vehicle = require('./models/Vehicle');
const Org = require('./models/Org');

mongoose.connect('mongodb://127.0.0.1:27017/moreTorque')
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

const seedVehicles = async () => {
    try {
        const vins = ['1HGCM82633A123456', '1FTFW1ET6EKF12345']; // Example VINs
        for (let vin of vins) {
            const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
            const { Results } = response.data;

            const vehicleDetails = {
                vin,
                manufacturer: Results.find(r => r.Variable === 'Manufacturer Name')?.Value,
                model: Results.find(r => r.Variable === 'Model')?.Value,
                year: Results.find(r => r.Variable === 'Model Year')?.Value,
                org: 'YOUR_ORG_ID_HERE' // Replace with an actual org ID
            };

            const vehicle = new Vehicle(vehicleDetails);
            await vehicle.save();
            console.log(`Vehicle ${vin} saved to database`);
        }
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

seedVehicles().then(() => mongoose.disconnect());
