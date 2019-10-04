const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PersonSchema = new Schema({
  personName: {
    type: String,
    require: true
  },
  contactNumber: {
    type: String,
    require: true
  }
});

module.exports = Person = mongoose.model("person", PersonSchema);
