import SibApiV3Sdk from "sib-api-v3-sdk";
import { jobAlertTemplate } from "./templates/jobAlert.js";
import { otpEmailTemplate } from "./templates/otpEmail.js";
import { renderTemplate } from "./utils/renderTemplate.js";
import dotenv from "dotenv";

dotenv.config();

/* ------------------ Brevo API Setup ------------------ */

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const SENDER = {
  email: process.env.EMAIL_USER || "no-reply@careerspage.app",
  name: "CareersPage",
};

/* ------------------ Job Alert Email ------------------ */

export const sendJobAlertEmail = async ({ to, name, job }) => {
  const content = jobAlertTemplate({ name, job });

  const html = renderTemplate({
    title: `${job.company} Careers: ${job.title}`,
    template: content,
  });

  await emailApi.sendTransacEmail({
    sender: SENDER,
    to: [{ email: to }],
    subject: `${job.company} Careers: ${job.title}`,
    htmlContent: html,
  });
};

/* ------------------ OTP Email ------------------ */

export const sendOtpEmail = async ({ to, name, otp }) => {
  const content = otpEmailTemplate({
    name,
    otp,
    expiresIn: 10,
  });

  const html = renderTemplate({
    title: "Verify your email address",
    template: content,
  });

  await emailApi.sendTransacEmail({
    sender: {
      ...SENDER,
      name: "CareersPage Security",
    },
    to: [{ email: to }],
    subject: "Your CareersPage verification code",
    htmlContent: html,
  });
};
