const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true },

  account: String,

  website: String,

  fuelReimbursementPolicy: { 
    type: Number, 
    default: 1000 
  },
  speedLimitPolicy: Number,

  parentOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Org' },
  
  childrenOrgs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Org' }],
});

const Org = mongoose.model('Org', orgSchema);
module.exports = Org;
