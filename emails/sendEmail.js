import nodemailer from "nodemailer";
import {jobAlertTemplate} from "./templates/jobAlert.js";
import {renderTemplate} from "./utils/renderTemplate.js";
import {otpEmailTemplate} from "./templates/otpEmail.js";
import dotenv from "dotenv";
dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendJobAlertEmail = async ({ to, name, job }) => {
  const content = jobAlertTemplate({ name, job });

  const html = renderTemplate({
    title: `${job.company} Careers: ${job.title}`,
    template: content
  });

  await transporter.sendMail({
    from: `"CareersPage" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${job.company} Careers: ${job.title}`,
    html
  });
};

export const sendOtpEmail = async ({ to, name, otp }) => {
    const content = otpEmailTemplate({
      name,
      otp,
      expiresIn: 10
    });
  
    const html = renderTemplate({
      title: "Verify your email address",
      template: content
    });
  
    await transporter.sendMail({
      from: `"CareersPage Security" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your CareersPage verification code",
      html
    });
  };
  
