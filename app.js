const express = require('express');
const app = express();

// Import the vehicle routes
const vehicleRoutes = require('./routes/vehicle');
const orgRoutes = require('./routes/org');

// Use the vehicle routes
app.use('/vehicles', vehicleRoutes);

app.use('/orgs', orgRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});


