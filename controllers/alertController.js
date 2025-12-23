import OTPVerification from "../models/OTPVerification.js";
import jobAlert from "../models/Alert.js";
import nodemailer from "nodemailer";
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
    await OTPVerification.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 minutes
    });

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

    console.log({ email, otp });

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    // Get latest OTP entry for this email
    const record = await OTPVerification.findOne({ email }).sort({ createdAt: -1 });

    if (!record)
      return res.status(400).json({ message: "No OTP found. Please request again." });

    // Compare
    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP" });

    // Mark verified
    record.verified = true;
    await record.save();

    return res.status(200).json({ message: "OTP verified successfully", verified: true });

  } catch (err) {
    return res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

export const handleAlertSubmit = async (req, res) => {
  try {
    const { email, experience, frequency, keywords, name, location, otherLocation } = req.body;

    // Check OTP verification entry
    const verified = await OTPVerification.findOne({ email, verified: true });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Please verify OTP first" });
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
