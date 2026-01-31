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

export const sendJobAlertEmail = async ({ to, name, jobs }) => {
  const content = jobAlertTemplate({ name, jobs });

  const title = jobs?.length > 1
      ? `${jobs?.length} Verified Jobs Matching Your Profile | CareersPage`
      : `New Job Alert: ${jobs[0]?.title} at ${jobs[0]?.company?.companyName}`;

    const html = renderTemplate({
      title,
      template: content, // your HTML from jobAlertTemplate
    });

    const subject = jobs.length > 1
    ? `Top ${jobs.length} Verified Job Opportunities for You | CareersPage`
    : `Exclusive Job Alert: ${jobs[0]?.title} at ${jobs[0]?.company?.companyName}`;

  await emailApi.sendTransacEmail({
    sender: SENDER,
    to: [{ email: to }],
    subject,
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
