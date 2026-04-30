import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  created_at: { type: String, required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual populate
contactSchema.virtual("clubDetails", {
  ref: "Club",
  localField: "club",
  foreignField: "_id",
  justOne: true
});

// Add an index on the club field for better query performance
contactSchema.index({ club: 1 });

export const ContactModel = mongoose.models.Contact || mongoose.model("Contact", contactSchema); 