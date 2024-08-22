const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const vehicleRoutes = require('./routes/vehicle');
const orgRoutes = require('./routes/org');

// Create an Express application
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/moreTorque')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB:", err));

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to support HTTP method override (e.g., for PUT and DELETE)
app.use(methodOverride('_method'));

// Root path
app.get("/", (req, res) => {
  res.send("Welcome to More Torque!");
});

// Use routes
app.use('/vehicles', vehicleRoutes);
app.use('/orgs', orgRoutes);

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).render('error', { error: 'Page not found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Something went wrong' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
