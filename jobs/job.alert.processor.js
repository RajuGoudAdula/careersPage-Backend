import Alert from "../models/Alert.js";
import Job from "../models/Job.js";
import { isJobMatched } from "../alerts/alert.matcher.js";
import { sendBrowserNotification } from "../notifications/push.service.js";

export async function processJobAlerts(jobId) {
  try {
    // 1️⃣ Load job with company populated
    const job = await Job.findById(jobId)
      .populate("company", "companyName")
      .lean();

    if (!job) return;

    // 2️⃣ Pre-filter alerts (indexed fields only)
    const alerts = await Alert.find({
      deleted: false,
      verified: true,
      $or: [
        {
          location: {
            $regex: new RegExp(`^${job.location.split(",")[0]}`, "i"),
          },
        },
        { location: { $exists: false } },
      ],
    }).lean();
    


    // 3️⃣ Fuzzy matching + browser notification
    for (const alert of alerts) {
      if (isJobMatched(job, alert)) {
        await sendBrowserNotification(alert?.pushSubscription, job);
      }
    }
  } catch (err) {
    console.error("Job alert processing failed:", err);
  }
}
