const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const RoomBookingSchema = new Schema({
  personId: {
    type: String,
    require: true
  },
  roomId: {
    type: String,
    require: true
  },
  checkInDt: {
    type: Number
  },
  checkOutDt: {
    type: Number
  },
  modfifiedDt: {
    type: Number,
    default: Math.trunc(Date.now() / 1000),
    require: true
  }
});

module.exports = RoomBooking = mongoose.model("roombooking", RoomBookingSchema);
