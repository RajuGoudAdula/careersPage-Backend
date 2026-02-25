import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    category: {
      type: String,
      enum: ["government", "it"],
      required: true
    },

    shortName: {
      type: String,
      trim: true
    },

    logo: {
      type: String // store URL (Cloudinary / S3)
    },

    favicon : {
      type: String
    },

    description: {
      type: String,
      maxlength: 2000
    },

    /* ================= CONTACT INFO ================= */

    website: {
      type: String
    },

    email: {
      type: String
    },

    phone: {
      type: String
    },

    /* ================= LOCATION ================= */

    city: {
      type: String
    },

    state: {
      type: String
    },

    country: {
      type: String,
      default: "India"
    },

    address: {
      type: String
    },

    /* ================= GOVERNMENT DETAILS ================= */

    governmentDetails: {
      ministry: String,
      department: String,
      organizationType: {
        type: String,
        enum: ["Central", "State", "PSU", "Autonomous", null],
        default: null
      },
      officialNotificationPage: String
    },

    /* ================= IT COMPANY DETAILS ================= */

    itDetails: {
      industry: String,
      companySize: String, 
      headquarters: String,
      officialCareersPage: String,
    },

    /* ================= ADMIN CONTROL ================= */

    isVerified: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    /* ================= STATS (Auto Updated) ================= */

    totalJobs: {
      type: Number,
      default: 0
    },

    totalActiveJobs: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

/* ================= INDEXING FOR PERFORMANCE ================= */

organizationSchema.index({ name: "text" });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ category: 1 });
organizationSchema.index({ state: 1 });

export default mongoose.model("Organization", organizationSchema);
