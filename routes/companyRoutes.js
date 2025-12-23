import express from "express";
import { createCompany, getCompanies,getCompanyDetailsById ,getCompanyJobs,updateCompanyById,deleteCompanyById, getCompaniesForUser} from "../controllers/companyController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", adminAuth, createCompany);
router.put('/:id',adminAuth,updateCompanyById);
router.delete('/:id',adminAuth,deleteCompanyById);
router.get("/", getCompanies);
router.get('/:id',getCompanyDetailsById);
router.get('/:id/jobs',getCompanyJobs);
router.get('/page/:page',getCompaniesForUser);

export default router;
