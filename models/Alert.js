import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    /* ================= COMMON FIELDS ================= */

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
      type: Object,
    },

    /* ================= IT ALERT FIELDS ================= */

    keywords: {
      type: [
        {
          label: { type: String },
          value: { type: String },
          type: { type: String, enum: ["role", "tech", "area"] },
        },
      ],
      default: [],
    },

    /* ================= GOVERNMENT ALERT FIELDS ================= */

    govCategories: {
      type: [
        {
          label: {
            type: String,
            required: true,
            trim: true,
          },
          value: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          type: {
            type: String,
            required: true,
            enum: ["central", "state", "education", "public-sector"],
          },
        },
      ],
      default: [],
      validate: {
        validator: function (val) {
          return val.length <= 3;
        },
        message: "You can select up to 3 government categories only",
      },
    },

    qualification: {
      type: String,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);



/* ================= INDEXING STRATEGY ================= */

// For fast filtering
AlertSchema.index({  location: 1, experience: 1 });

// Optional: prevent duplicate active alerts per email + type
AlertSchema.index(
  { email: 1,  deleted: 1 },
  { unique: false }
);

export default mongoose.models.Alert ||
  mongoose.model("Alert", AlertSchema);