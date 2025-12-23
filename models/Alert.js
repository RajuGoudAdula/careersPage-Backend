import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, index: true },
  keywords: { type: String }, // comma separated or JSON
  experience: { type: String }, // "Fresher", "1-2 years" etc.
  location: { type: String },
  frequency: { type: String, default: "daily" },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }, // optional double opt-in
});

export default mongoose.models.Alert || mongoose.model("Alert", AlertSchema);
