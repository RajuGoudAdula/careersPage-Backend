import express from "express";
import { postNewJobOfCompany, editJobOfCompany,deleteJobById, getCompanyJobs, getInputData, getJobs, getJobDetails} from "../controllers/jobController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/:companyId/newJob',adminAuth, postNewJobOfCompany);
router.put('/:companyId/:jobId', adminAuth ,editJobOfCompany);
router.delete('/:jobId/company/:id',adminAuth,deleteJobById);

router.get("/:mode/input-data", getInputData);
router.get("/search", getJobs);
router.get('/:companyId',getCompanyJobs);
router.get("/job/:jobId",getJobDetails);

export default router;
