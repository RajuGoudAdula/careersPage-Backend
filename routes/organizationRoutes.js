import express from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationDetailsById,
  getOrganizationJobs,
  updateOrganizationById,
  deleteOrganizationById,
  getOrganizationsForUser,
//   autoFillOrganization
} from "../controllers/organizationController.js";

import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

router.post("/create", adminAuth, createOrganization);
router.put("/:id", adminAuth, updateOrganizationById);
router.delete("/:id", adminAuth, deleteOrganizationById);
// router.post("/autofill", adminAuth, autoFillOrganization);

/* ================= PUBLIC ROUTES ================= */

router.get("/", getOrganizations);
router.get("/page/:page", getOrganizationsForUser);
router.get("/:id", getOrganizationDetailsById);
router.get("/:id/jobs", getOrganizationJobs);

export default router;
