import { sendJobAlertEmail } from "../emails/sendEmail.js";
import Alert from "../models/Alert.js";
import Job from "../models/Job.js";
import { isJobMatched } from "./alert.matcher.js";

export async function processAlertEmails({ frequency, hours }) {
  const alerts = await Alert.find({
    frequency,
    verified: true,
    deleted: false
  });

  const jobs = await Job.find({
    createdAt: { $gte: new Date(Date.now() - hours * 3600000) }
  }).populate("company", "companyName");

  for (const alert of alerts) {
    for (const job of jobs) {
      if (isJobMatched(job, alert)) {
        await sendJobAlertEmail({
          to: alert.email,
          name: alert.name || "There",
          job
        });
      }
    }

    alert.lastNotifiedAt = new Date();
    await alert.save();
  }
}
