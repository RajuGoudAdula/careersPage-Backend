import Job from "../models/Job.js";
import Organization from "../models/Organization.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { triggerN8nJobAutomation } from "../services/n8n.service.js";
import { processJobAlerts } from "../jobs/job.alert.processor.js";

dayjs.extend(relativeTime);


export const postNewJob = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const jobData = { ...req.body };

    console.log(organizationId,jobData);

    // Validate ObjectId format
    if (!organizationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format",
      });
    }

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (organization.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot post job for inactive organization",
      });
    }

    // 🔥 IMPORTANT FIX
    const category = (organization.category || "").toLowerCase();

    // Attach organization + category
    jobData.organization = organizationId;
    jobData.category = category;

    // ✅ Remove tags if not IT
    if (category !== "it") {
      jobData.tags = [];
    }

    // Optional: ensure tags is always array
    if (!Array.isArray(jobData.tags)) {
      jobData.tags = [];
    }

    const newJob = await Job.create(jobData);

    // Update organization stats
    organization.totalJobs += 1;
    if (newJob.status === "active") {
      organization.totalActiveJobs += 1;
    }
    await organization.save();

    // setImmediate(() => {
    //   processJobAlerts(newJob._id);
    // });

    // triggerN8nJobAutomation({
    //   job: newJob,
    //   organization,
    // });

    console.log("Job created");

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });

  } catch (error) {
    console.error("Job creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const editJob = async (req, res) => {
  try {
    const { organizationId, jobId } = req.params;
    const updates = req.body;

    const job = await Job.findOne({
      _id: jobId,
      organization: organizationId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found for this organization",
      });
    }

    const oldStatus = job.status;

    Object.assign(job, updates);
    await job.save();

    // Update active stats if status changed
    if (updates.status) {
      const organization = await Organization.findById(organizationId);

      if (oldStatus === "active" && updates.status !== "active") {
        organization.totalActiveJobs -= 1;
      }

      if (oldStatus !== "active" && updates.status === "active") {
        organization.totalActiveJobs += 1;
      }

      await organization.save();
    }

    // setImmediate(() => {
    //   processJobAlerts(job._id);
    // });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
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
    const { jobId, id } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.organization.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "This job does not belong to this organization",
      });
    }

    await Job.findByIdAndDelete(jobId);

    // Update stats
    const organization = await Organization.findById(id);
    organization.totalJobs -= 1;

    if (job.status === "active") {
      organization.totalActiveJobs -= 1;
    }

    await organization.save();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });

  } catch (err) {
    console.error("Error deleting job:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const getOrganizationJobs = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const jobs = await Job.find({
      organization: organizationId,
      status: "active"
    })
      .populate("organization", "name logo category")
      .sort({ createdAt: -1 });

    const formattedJobs = jobs.map(job => ({
      ...job.toObject(),
      postedOn: dayjs(job.createdAt).fromNow()
    }));

    res.status(200).json({
      success: true,
      jobs: formattedJobs
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getInputData = async (req, res) => {
  try {
    const { mode } = req.params;

    let data = [];

    if (mode === "title") {
      data = await Job.distinct("title", { status: "active" });
    } 
    else if (mode === "organization") {
      data = await Organization.distinct("name", { status: "active" });
    } 
    else if (mode === "state") {
      data = await Job.distinct("location.state", { status: "active" });
    } 
    else if (mode === "category") {
      data = await Organization.distinct("category", { status: "active" });
    } 
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid mode. Use title | organization | state | category",
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("Error fetching input data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch input data",
    });
  }
};


export const getJobs = async (req, res) => {
  try {
    // ===== Query Params =====
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const category = req.query.category; // government / it
    const search = req.query.search;
    const status = req.query.status || "active";

    const skip = (page - 1) * limit;

    // ===== Build Filter =====
    const filter = { status };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // ===== Fetch Jobs =====
    const jobs = await Job.find(filter)
      .populate({
        path: "organization",
        select: "name logo favicon slug website category"
      })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // ===== Total Count =====
    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      jobs
    });

  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};




export const getJobDetails = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Validate ObjectId format
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const job = await Job.findById(jobId)
      .populate({
        path: "organization",
        select: "name logo slug category website",
      })
      .exec();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Optional: auto increase views
    job.views += 1;
    await job.save();

    return res.status(200).json({
      success: true,
      job,
    });

  } catch (err) {
    console.error("Error fetching job details:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getLatestJobs = async (req, res) => {
  try {
    const today = new Date();

    const jobs = await Job.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("organization", "name logo favicon slug website category")
    .select("-__v");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Get Latest Jobs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest jobs",
    });
  }
};



/* ================= GET SEARCH JOBS ================= */
export const getSearchJobs = async (req, res) => {
  try {
    const {
      category,
      search,
      location,
      experience,
      qualification,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];

    // ✅ 1️⃣ TEXT SEARCH MUST BE FIRST
    if (search) {
      pipeline.push({
        $match: { $text: { $search: search } },
      });
    }

    // ✅ 2️⃣ Base filter
    pipeline.push({
      $match: { status: "active" },
    });

    // ✅ 3️⃣ Lookup organization
    pipeline.push({
      $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organization",
      },
    });

    pipeline.push({ $unwind: "$organization" });

    // ✅ 4️⃣ Category filter
    if (category) {
      pipeline.push({
        $match: {
          "organization.category": category.toLowerCase(),
        },
      });
    }

    // ✅ 5️⃣ Other filters
    if (location) {
      pipeline.push({
        $match: {
          $or: [
            { "location.state": { $regex: location, $options: "i" } },
            { "location.city": { $regex: location, $options: "i" } }
          ]
        }
      });
    }

    if (experience) {
      if (experience === "Fresher") {
        pipeline.push({
          $match: {
            minExperience: 0,
            maxExperience: 0,
          },
        });
      } else {
        const [min, max] = experience
          .replace(" years", "")
          .split("-")
          .map(Number);
    
        pipeline.push({
          $match: {
            minExperience: { $lte: max },
            maxExperience: { $gte: min },
          },
        });
      }
    }

    if (qualification) {
      pipeline.push({
        $match: { qualificationText: qualification },
      });
    }

    // ✅ 6️⃣ Sort
    pipeline.push({ $sort: { postedDate: -1 } });

    // ✅ 7️⃣ Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const jobs = await Job.aggregate(pipeline);

    // ✅ COUNT PIPELINE (without skip & limit)
    const countPipeline = pipeline.filter(
      (stage) => !stage.$skip && !stage.$limit
    );

    countPipeline.push({ $count: "total" });

    const countResult = await Job.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      jobs,
    });

  } catch (err) {
    console.error("Error in getSearchJobs:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* ================= GET JOB SUGGESTIONS ================= */
export const getJobSuggestions = async (req, res) => {
  try {
    const { category, search = "", limit = 10 } = req.query;

    const limitNum = Math.min(50, parseInt(limit) || 10);

    // Escape special regex characters (important!)
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pipeline = [];

    /* ✅ 1. Active jobs only */
    pipeline.push({
      $match: { status: "active" },
    });

    /* ✅ 2. Title partial match */
    if (search && search.trim() !== "") {
      pipeline.push({
        $match: {
          title: {
            $regex: escapeRegex(search.trim()),
            $options: "i",
          },
        },
      });
    }

    /* ✅ 3. Lookup organization */
    pipeline.push({
      $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organization",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$organization",
        preserveNullAndEmptyArrays: false,
      },
    });

    /* ✅ 4. Category filter (CASE INSENSITIVE SAFE) */
    if (category && category.trim() !== "") {
      pipeline.push({
        $match: {
          "organization.category": {
            $regex: `^${escapeRegex(category.trim())}$`,
            $options: "i",
          },
        },
      });
    }

    /* ✅ 5. Sort + Limit */
    pipeline.push(
      { $sort: { postedDate: -1 } },
      { $limit: limitNum }
    );

    /* ✅ 6. Return autosuggest format */
    pipeline.push({
      $project: {
        _id: 1,
        label: "$title",   // shown in dropdown
        value: "$slug",    // used if needed
      },
    });

    const suggestions = await Job.aggregate(pipeline);

    return res.json({
      success: true,
      suggestions,
    });

  } catch (err) {
    console.error("getJobSuggestions error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};