import OTPVerification from "../models/OTPVerification.js";
import jobAlert from "../models/Alert.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// SEND OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save to DB
    await OTPVerification.findOneAndUpdate(
      { email }, // find by email
      {
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
      {
        upsert: true,     // create if not exists
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailOptions = {
      from: "Job Alert System <no-reply@jobalert.com>",
      to: email,
      subject: "Your Job Alert OTP",
      html: `<h3>Your OTP is: <b>${otp}</b></h3>
             <p>Valid for 5 minutes only.</p>`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};


// VERIFY OTP

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required",verified: false });
    }

    // 1️⃣ Find OTP record
    const record = await OTPVerification.findOne({ email });

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request again.",
        verified: false,
      });
    }

    // 2️⃣ Check expiry
    if (record.expiresAt < new Date()) {
      await OTPVerification.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired",verified: false });
    }

    // 3️⃣ Compare OTP
    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP",verified: false });
    }

    // 4️⃣ OTP verified → delete it
    await OTPVerification.deleteOne({ email });

    // 5️⃣ Generate verification JWT (IMPORTANT)
    const verificationToken = jwt.sign(
      {
        email,
        purpose: "OTP_VERIFIED",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" } // short-lived token
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
      verificationToken, // 👈 send to frontend
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      message: "Verification failed",
      verified: false
    });
  }
};




export const handleAlertSubmit = async (req, res) => {
  try {
    const { email, experience, frequency, keywords, name, location, otherLocation ,verificationToken} = req.body;

    
  // 1️⃣ Token must be present
  if (!verificationToken) {
    return res.status(401).json({
      success: false,
      message: "Email verification required",
    });
  }

  let decoded;

  try {
    // 2️⃣ Verify JWT
    decoded = jwt.verify(
      verificationToken,
      process.env.JWT_SECRET
    );
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }

  // 3️⃣ Validate token purpose
  if (decoded.purpose !== "OTP_VERIFIED") {
    return res.status(403).json({
      success: false,
      message: "Invalid verification token purpose",
    });
  }

  // 4️⃣ Email consistency check (IMPORTANT)
  if (decoded.email !== email) {
    return res.status(403).json({
      success: false,
      message: "Verification token does not match email",
    });
  }


    // Create alert record
    const alert = new jobAlert({
      email,
      name,
      keywords,
      frequency,
      experience,
      location: location || otherLocation,
      verified: true,
    });

    await alert.save();

    return res.status(201).json({
      success: true,
      message: "Job Alert created successfully",
      alertId: alert._id,
    });

  } catch (error) {
    console.error("Error creating alert:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;


    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: "Alert ID is required",
      });
    }

    // Find alert using primary key _id
    const alert = await jobAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "No alert found for this ID",
      });
    }

    return res.status(200).json({
      success: true,
      alert,
    });

  } catch (error) {
    console.error("Error fetching alert:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




export const getContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1️⃣ Validate fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Check if this email has created a Job Alert
    const existingAlert = await jobAlert.findOne({ email });

    if (!existingAlert) {
      return res.status(200).json({
        success: false,
        message: "Please create a job alert first before contacting.",
        requiresAlert: true,
      });
    }

    // 3️⃣ Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4️⃣ Email Data (send to admin)
    const mailOptions = {
      from: `"Careers Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,  // Admin receives message
      subject: `New Contact Message – ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p>This user already has a job alert created.</p>
      `,
    };

    // 5️⃣ Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Message sent to admin successfully.",
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
};


export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const payload = req.body;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: "Alert ID is required",
      });
    }

    // 1️⃣ Find existing alert
    const alert = await jobAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    /* ------------------------------------------------
       2️⃣ EMAIL UPDATE + VERIFICATION TOKEN CHECK
    ------------------------------------------------ */

    const emailChanged =
      payload.email && payload.email !== alert.email;

    if (emailChanged) {
      const { verificationToken } = payload;

      if (!verificationToken) {
        return res.status(401).json({
          success: false,
          message: "Email verification required",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          verificationToken,
          process.env.JWT_SECRET
        );
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      // 🔐 Validate token purpose
      if (decoded.purpose !== "OTP_VERIFIED") {
        return res.status(403).json({
          success: false,
          message: "Invalid verification token",
        });
      }

      // 🔐 Ensure token email matches new email
      if (decoded.email !== payload.email) {
        return res.status(403).json({
          success: false,
          message: "Verification token does not match email",
        });
      }

      // ✅ Safe to update email
      alert.email = payload.email.toLowerCase();
      alert.verified = true;
    }

    /* ------------------------------------------------
       3️⃣ UPDATE OTHER FIELDS
    ------------------------------------------------ */

    if (payload.name !== undefined)
      alert.name = payload.name;

    if (payload.keywords !== undefined) {
      alert.keywords = Array.isArray(payload.keywords)
        ? payload.keywords.join(", ")
        : payload.keywords;
    }

    if (payload.experience !== undefined)
      alert.experience = payload.experience;

    if (payload.location !== undefined)
      alert.location = payload.location;

    if (payload.frequency !== undefined)
      alert.frequency = payload.frequency;

    // 4️⃣ Save
    await alert.save();

    return res.status(200).json({
      success: true,
      message: "Alert updated successfully",
    });

  } catch (error) {
    console.error("Update Alert Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: "Alert ID is required",
      });
    }

    const alert = await jobAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    await jobAlert.findByIdAndDelete(alertId);

    return res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting alert",
    });
  }
};