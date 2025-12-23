import Job from "../models/Job.js";
import Company from "../models/Company.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

export const postNewJobOfCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(req.body);
    const { title, location, experience, link ,salary,description,jobType} = req.body;

    // Validate companyId
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format",
      });
    }

    // Check if company exists
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Create job
    const newJob = await Job.create({
      title,
      location,
      experience,
      link,
      salary,
      description,
      jobType,
      company: companyId,
      createdBy: req.adminId   // from middleware
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const editJobOfCompany = async (req, res) => {
  try {
    const { companyId, jobId } = req.params;
    const updates = req.body;

    // Validate IDs
    if (!companyId.match(/^[0-9a-fA-F]{24}$/) || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Find job & ensure it belongs to this company
    const job = await Job.findOne({ _id: jobId, company: companyId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found for this company",
      });
    }

    // Update job
    Object.assign(job, updates);
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



export const deleteJobById = async (req, res) => {
  try {
    const { jobId, id: companyId } = req.params;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Check if this job belongs to the given company
    if (job.company.toString() !== companyId) {
      return res.status(400).json({
        success: false,
        message: "This job does not belong to this company"
      });
    }

    // Delete job
    await Job.findByIdAndDelete(jobId);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting job:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getCompanyJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Check if company exists
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({ message: "Company not found" });
    }

    const totalJobs = await Job.countDocuments({ company: companyId });

    // Fetch jobs with only relevant fields
    const jobsRaw = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title location experience jobType salary description link createdAt");

    // Map jobs to remove _id and format createdAt
    const jobs = jobsRaw.map(job => ({
      title: job.title,
      location: job.location,
      experience: job.experience,
      jobType: job.jobType,
      salary: job.salary,
      description: job.description,
      link: job.link,
      postedOn: dayjs(job.createdAt).fromNow(), // relative time
    }));

    res.json({
      success: true,
      jobs,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getInputData = async (req, res) => {
  try {
    const {mode} = req.params;
    let data;
    if(mode === "title"){
      data = await Job.distinct("title");
    }else if(mode === "company"){
      data = await Company.distinct("companyName");
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch titles" });
  }
};


export const getJobs = async (req, res) => {
  try {
    const { title, company, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    /* ---------------------------------
       SEARCH BY JOB TITLE
    ----------------------------------*/
    if (title) {
      const [jobs, total] = await Promise.all([
        Job.find({
          title: { $regex: `^${title}$`, $options: "i" }
        })
          .populate("company")
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),

        Job.countDocuments({
          title: { $regex: `^${title}$`, $options: "i" }
        })
      ]);

      const formattedJobs = jobs.map(job => ({
        ...job.toObject(),
        postedOn: dayjs(job.createdAt).fromNow()
      }));

      return res.status(200).json({
        mode: "title",
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        jobs: formattedJobs
      });
    }

    /* ---------------------------------
       SEARCH BY COMPANY
    ----------------------------------*/
    if (company) {
      // Find company details
      const companyData = await Company.findOne({
        companyName: { $regex: `^${company}$`, $options: "i" }
      });

      if (!companyData) {
        return res.status(404).json({ message: "Company not found" });
      }

      const [jobs, total] = await Promise.all([
        Job.find({ company: companyData._id })
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),

        Job.countDocuments({ company: companyData._id })
      ]);

      const formattedJobs = jobs.map(job => ({
        ...job.toObject(),
        postedOn: dayjs(job.createdAt).fromNow()
      }));

      return res.status(200).json({
        mode: "company",
        company: companyData,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        jobs: formattedJobs
      });
    }

    /* ---------------------------------
       INVALID REQUEST
    ----------------------------------*/
    return res.status(400).json({
      message: "Either title or company query is required"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};
