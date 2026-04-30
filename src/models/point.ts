import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
  entrantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entrant",
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  cutoffTime: {
    type: String,
    required: false
  },
  dogPoints: [{
    NZFSSRegistration: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true
    }
  }],
  heatsData: [{
    heat: String,
    temperature: String,
    distance: String,
    class: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for populating entrant datas
pointSchema.virtual('entrant', {
  ref: 'Entrant',
  localField: 'entrantId',
  foreignField: '_id',
  justOne: true
});

// Update the updatedAt timestamp before saving
pointSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export const Point = mongoose.model("Point", pointSchema); 