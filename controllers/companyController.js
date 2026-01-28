import Company from "../models/Company.js";
import Job from "../models/Job.js";
import dayjs from "dayjs";
import axios from "axios";
import * as cheerio from "cheerio";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);


async function fetchWebsiteText(url) {
  const { data: html } = await axios.get(url, {
    timeout: 10000,
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, noscript").remove();

  const text = $("body").text().replace(/\s+/g, " ").trim();
  return text.slice(0, 15000); // IMPORTANT: token limit safety
}


export const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      logo,
      favicon,
      website,
      careersPage,
      description,
      industry,
      headquarters,
      companySize,
      atsUsed,
      contactEmail
    } = req.body;

    const company = await Company.create({
      companyName,
      logo,
      favicon,
      website,
      careersPage,
      description,
      industry,
      headquarters,
      companySize,
      atsUsed,
      contactEmail,
      createdBy: req.adminId
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      company
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const autoFillCompany = async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    if (!websiteUrl) {
      return res.status(400).json({ message: "Website URL is required" });
    }

    const websiteText = await fetchWebsiteText(websiteUrl);

    if (!websiteText) {
      return res.status(400).json({ message: "Unable to fetch website content" });
    }

    const prompt = `
      Extract company details from the following website content.
      Return ONLY valid JSON.

      Fields:
      companyName, logo, favicon, careersPage, description, industry,
      headquarters, companySize, atsUsed, contactEmail

      Rules:
      - If unknown, return ""
      - Do NOT guess
      - Use only provided content
      - No explanations
      - No markdown

      Website Content:
      ${websiteText}
      `;

    const aiOutput = await geminiChat(prompt);

    let aiData;
    try {
      aiData = JSON.parse(aiOutput);
    } catch {
      console.error("Gemini raw output:", aiOutput);
      return res.status(500).json({ message: "Invalid AI JSON" });
    }

    res.status(200).json({
      message: "Company details generated",
      data: aiData
    });

  } catch (err) {
    console.error("AutoFill Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};




export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    if (companies.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No companies found"
      });
    }

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getCompanyDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Params ID ",id);

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format"
      });
    }

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: company
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getCompanyJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Jobs per page
    const skip = (page - 1) * limit;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format"
      });
    }

    // Count all jobs for this company
    const totalJobs = await Job.countDocuments({ company: id });

    // Fetch paginated jobs
    const jobs = await Job.find({ company: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      companyId: id,
      page,
      perPage: limit,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      jobs
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const updateCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const form = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format",
      });
    }

    // Find & update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      form,
      { new: true } // return updated document
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const deleteCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format",
      });
    }

    // Delete company
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // OPTIONAL: Remove all jobs under this company
    await Job.deleteMany({ company: id });

    return res.status(200).json({
      success: true,
      message: "Company and its jobs deleted successfully",
      company: deletedCompany
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



export const getCompaniesForUser = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 12; // 4 per row, 3 rows = 12 per page
    const skip = (page - 1) * limit;

    const totalCompanies = await Company.countDocuments();

    const companiesRaw = await Company.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "companyName logo favicon website careersPage description industry headquarters companySize atsUsed contactEmail createdAt"
      );

    // Map to remove _id and rename createdAt → postedOn
    const companies = companiesRaw.map((c) => ({
      _id : c._id,
      companyName: c.companyName,
      logo: c.logo,
      favicon: c.favicon,
      website: c.website,
      careersPage: c.careersPage,
      description: c.description,
      industry: c.industry,
      headquarters: c.headquarters,
      companySize: c.companySize,
      atsUsed: c.atsUsed,
      contactEmail: c.contactEmail,
      postedOn: dayjs(c.createdAt).fromNow(), // relative time
    }));

    res.json({
      companies,
      currentPage: page,
      totalPages: Math.ceil(totalCompanies / limit),
      totalCompanies,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

