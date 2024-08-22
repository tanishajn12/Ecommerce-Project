const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: true,
    unique: true,
    minlength: 17,
    maxlength: 17,
  },
  manufacturer: String,
  model: String,
  year: String,
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true,
  },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
