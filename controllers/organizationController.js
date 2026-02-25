import Organization from "../models/Organization.js";
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


export const createOrganization = async (req, res) => {
    try {
      const {
        name,
        shortName,
        logo,
        favicon,
        website,
        email,
        phone,
        city,
        state,
        country,
        address,
        description,
        category,
        ministry,
        department,
        organizationType,
        officialNotificationPage,
        officialCareersPage,
        industry,
        companySize,
        headquarters,
        isVerified,
        status
      } = req.body;

      // 🔥 Slug Generator
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      // 🔥 Build Object Based on Category
      const organizationData = {
        name,
        shortName,
        slug,
        logo,
        favicon,
        website,
        email,
        phone,
        city,
        state,
        country,
        address,
        description,
        category,
        isVerified: isVerified || false,
        status: status || "active",
        createdBy: req.adminId
      };

      // 🔥 Government Details
      if (category === "government") {
        organizationData.governmentDetails = {
          ministry: ministry || null,
          department: department || null,
          organizationType: organizationType || null,
          officialNotificationPage: officialNotificationPage || null
        };
      }

      // 🔥 IT Company Details
      if (category === "it") {
        organizationData.itDetails = {
          industry: industry || null,
          companySize: companySize || null,
          officialCareersPage: officialCareersPage || null,
          headquarters: headquarters || null
        };
      }

      const organization = await Organization.create(organizationData);

      return res.status(201).json({
        success: true,
        message: "Organization created successfully",
        organization
      });

    } catch (err) {
      console.error("Create Organization Error:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
};


export const updateOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Updating...");

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    const updated = await Organization.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      organization: updated
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const deleteOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    const deleted = await Organization.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    await Job.deleteMany({ organization: id });

    res.status(200).json({
      success: true,
      message: "Organization and related jobs deleted",
      organization: deleted
    });

  } catch (err) {
    res.status(500).json({
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





export const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });

  } catch (err) {
    console.error("Get Organizations Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




export const getOrganizationDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Organization ID:", id);

    // ✅ Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID format"
      });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: organization
    });

  } catch (err) {
    console.error("Get Organization Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




export const getOrganizationJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    const totalJobs = await Job.countDocuments({ organization: id });

    const jobs = await Job.find({ organization: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      organizationId: id,
      page,
      perPage: limit,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      jobs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getOrganizationsForUser = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const total = await Organization.countDocuments();

    const organizationsRaw = await Organization.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "name logo favicon website description category itDetails governmentDetails createdAt"
      );

    const organizations = organizationsRaw.map((org) => ({
      _id: org._id,
      name: org.name,
      logo: org.logo,
      favicon: org.favicon,
      website: org.website,
      description: org.description,
      category: org.category,
      industry: org.itDetails?.industry || null,
      headquarters: org.itDetails?.headquarters || null,
      ministry: org.governmentDetails?.ministry || null,
      postedOn: dayjs(org.createdAt).fromNow()
    }));

    res.json({
      organizations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrganizations: total
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


