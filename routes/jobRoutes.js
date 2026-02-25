import express from "express";
import {
  postNewJob,
  editJob,
  deleteJobById,
  getOrganizationJobs,
  getInputData,
  getJobs,
  getJobDetails,
  getLatestJobs,
  getSearchJobs,
  getJobSuggestions
} from "../controllers/jobController.js";

import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// Create job under organization
router.post(
  "/:organizationId/newJob",
  adminAuth,
  postNewJob
);

// Edit job
router.put(
  "/:organizationId/:jobId",
  adminAuth,
  editJob
);

// Delete job
router.delete(
  "/:jobId/organization/:id",
  adminAuth,
  deleteJobById
);

//Get jobs
router.get('/',adminAuth,getJobs);


/* ================= PUBLIC ROUTES ================= */

// Search jobs
router.get("/search", getJobs);

// Get distinct titles or organizations
router.get("/input-data/:mode", getInputData);

router.get("/latest",getLatestJobs);

// Get all jobs of one organization
router.get("/:organizationId", getOrganizationJobs);

router.get("/job/search-jobs",getSearchJobs);
router.get("/job/job-suggestions",getJobSuggestions);

// Get single job details
router.get("/job/:jobId", getJobDetails);



export default router;