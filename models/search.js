const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
    fromPin: String,
    toPin: String,
    distance: String
  });
  
  module.exports = mongoose.model('Search', searchSchema);
    