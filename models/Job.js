import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    /* ================= EMPLOYMENT (Mainly IT) ================= */

    employmentType: {
      type: String,
      enum: ["full-time", "contract", "internship","remote"],
      required: function () {
        return this.category === "it";
      }
    },

    experienceText: {
      type: String,
      trim: true,
      required: function () {
        return this.category === "it";
      }
    },

    /* ================= LOCATION ================= */

    location: {
      state: {
        type: String,
        trim: true,
        index: true
      },
      city: {
        type: String,
        trim: true
      }
    },

    /* ================= ELIGIBILITY & DETAILS ================= */

    salaryText: {
      type: String,
      trim: true
    },

    qualificationText: {
      type: String,
      trim: true,
      required: function () {
        return this.category === "government";
      }
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true
    },

    tags: {
      type: [String],
      default: [],
    },

    /* ================= IMPORTANT DATES ================= */

    postedDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    applicationEndDate: {
      type: Date,
      required: function () {
        return this.category === "government";
      },
      index: true
    },

    /* ================= APPLICATION ================= */

    applicationLink: {
      type: String,
      required: true,
      trim: true
    },

    notificationPDF: {
      type: String,
      trim: true,
      required: function () {
        return this.category === "government";
      }
    },

    source: {
      type: String,
      trim: true
    },

    /* ================= STATUS ================= */

    status: {
      type: String,
      enum: ["active", "expired", "draft"],
      default: "active",
      index: true
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ================= SEO ================= */

    metaTitle: {
      type: String,
      trim: true
    },

    metaDescription: {
      type: String,
      trim: true
    },

    /* ================= ANALYTICS ================= */

    views: {
      type: Number,
      default: 0
    },

    clicks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

/* ================= AUTO EXPIRE LOGIC ================= */
JobSchema.pre("save", function (next) {
  if (this.applicationEndDate && this.applicationEndDate < new Date()) {
    this.status = "expired";
  }
  next();
});

/* ================= COMPOUND INDEXES FOR PERFORMANCE ================= */

// For category pages
JobSchema.index({ category: 1, status: 1, postedDate: -1 });

// For deadline sorting (Gov jobs)
JobSchema.index({ category: 1, applicationEndDate: 1 });

// For featured jobs
JobSchema.index({ isFeatured: 1, status: 1 });

// Text search optimization
JobSchema.index({
  title: "text",
  shortDescription: "text",
  tags: "text"
});

export default mongoose.model("Job", JobSchema);