import { sendJobAlertEmail } from "../emails/sendEmail.js";
import Alert from "../models/Alert.js";
import Job from "../models/Job.js";
import { isJobMatched } from "./alert.matcher.js";

/**
 * Process alert emails
 * Sends a single email per user containing all matched jobs
 * @param {Object} options
 * @param {"daily"|"weekly"} options.frequency
 * @param {number} options.hours - Lookback hours
 */
export async function processAlertEmails({ frequency, hours }) {
  // 1️⃣ Fetch active alerts for the given frequency
  const alerts = await Alert.find({
    frequency,
    verified: true,
    deleted: false
  });

  // 2️⃣ Fetch jobs created in the last `hours` hours
  const jobs = await Job.find({
    createdAt: { $gte: new Date(Date.now() - hours * 3600000) }
  }).populate("company", "companyName");

  // 3️⃣ Process each alert
  for (const alert of alerts) {
    // Filter matched jobs for this alert
    const matchedJobs = jobs.filter((job) => isJobMatched(job, alert));

    // If there are no matched jobs, skip sending
    if (matchedJobs.length === 0) continue;

    // 4️⃣ Send ONE email with all matched jobs
    await sendJobAlertEmail({
      to: alert.email,
      name: alert.name || "There",
      jobs: matchedJobs // pass array of jobs instead of a single job
    });

    // 5️⃣ Update last notified timestamp
    alert.lastNotifiedAt = new Date();
    await alert.save();
  }
}
