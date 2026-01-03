import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    keywords: {
      type: [String], // stored as array for better querying
      default: [],
      index: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      index: true,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.models.Alert ||
  mongoose.model("Alert", AlertSchema);
