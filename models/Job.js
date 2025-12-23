import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  jobType: { type: String, required: true, trim: true },

  salary: { type: String, required: true, trim: true },       // added
  description: { type: String, required: true },              // added

  link: { type: String, required: true, trim: true },

  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
}, 
{ timestamps: true }
);

export default mongoose.model("Job", jobSchema);

