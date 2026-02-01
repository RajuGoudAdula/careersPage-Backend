import { sendJobAlertEmail } from "../emails/sendEmail.js";
import Alert from "../models/Alert.js";
import Job from "../models/Job.js";
import { isJobMatched } from "./alert.matcher.js";

export async function processAlertEmails({ frequency, hours }) {
  // 1️⃣ Fetch active alerts
  const alerts = await Alert.find({
    frequency,
    verified: true,
    deleted: false
  });

  // 2️⃣ Process alerts ONE BY ONE
  for (const alert of alerts) {

    // ✅ Use lastNotifiedAt to prevent duplicates
    const cutoffTime = alert.lastNotifiedAt
      ? alert.lastNotifiedAt
      : new Date(Date.now() - hours * 3600000);

    // 3️⃣ Fetch ONLY new jobs since last email
    const jobs = await Job.find({
      createdAt: { $gt: cutoffTime }
    }).populate("company", "companyName");

    // 4️⃣ Match jobs for this alert
    const matchedJobs = jobs.filter((job) =>
      isJobMatched(job, alert)
    );

    // 5️⃣ Skip if nothing new
    if (matchedJobs.length === 0) continue;

    // 6️⃣ Send ONE email with all new jobs
    await sendJobAlertEmail({
      to: alert.email,
      name: alert.name || "There",
      jobs: matchedJobs
    });

    // 7️⃣ Update lastNotifiedAt AFTER successful send
    alert.lastNotifiedAt = new Date();
    await alert.save();
  }
}
