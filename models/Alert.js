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
      type: [
        {
          label: { type: String },
          value: { type: String },
          type: { type: String, enum: ["role", "tech", "area"] },
        }
      ],
      default: [],
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


    verified: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    lastNotifiedAt: {
      type: Date,
    },
    pushSubscription: {
      type: Object
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.models.Alert ||
  mongoose.model("Alert", AlertSchema);
