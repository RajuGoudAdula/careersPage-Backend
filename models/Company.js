import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  logo: { type: String, default: "" },   // URL of company logo
  favicon : {type: String, default: ""},
  website: { type: String, required: true },
  careersPage: { type: String, required: true },
  description: { type: String, default: "" },
  industry: { type: String, default: "" },
  headquarters: { type: String, default: "" },
  companySize: { type: String, default: "" }, // e.g. "1-10", "1000+"
  atsUsed: { type: String, default: "" },    // ATS name
  contactEmail: { type: String, default: "" },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
