import mongoose from "mongoose";

const entrantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  raceFormat: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  customClass: String,
  associatedDog: [{
    driverName: String,
    name: String,
    NZFSSRegistration: String,
    dob: String,
    breed: String
  }],
  raceType: {
    type: String,
    enum: ["musher", "harness", "weightpull", "started"],
    required: true
  },
  startTime: String,
  raceTime: String,
  cutoffTime: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  temperature: String,
  distance: String,
  heat: String,
  heatsData: [{
    heat: String,
    temperature: String,
    distance: String,
    class: String
  }],
  dogWeight: String,
  weightPulled: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Entrant = mongoose.model("Entrant", entrantSchema); 