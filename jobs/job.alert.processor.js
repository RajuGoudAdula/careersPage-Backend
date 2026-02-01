import {sendBrowserNotification} from "../notifications/push.service.js";
import {isJobMatched} from "../alerts/alert.matcher.js";
import Job from "../models/Job.js";
import Alert from "../models/Alert.js";

export async function processJobAlerts(jobId) {
  try {
    const job = await Job.findById(jobId)
      .populate("company", "companyName logo")
      .lean();

    if (!job) return;

    const alerts = await Alert.find({
      deleted: false,
      verified: true,
      pushSubscription: { $exists: true },
      $or: [
        {
          location: {
            $regex: new RegExp(`^${job.location.split(",")[0]}`, "i"),
          },
        },
        { location: { $exists: false } },
      ],
    });

    for (const alert of alerts) {
      if (!isJobMatched(job, alert)) continue;

      const result = await sendBrowserNotification(
        alert.pushSubscription,
        job
      );

      if (result?.shouldDelete) {
        await Alert.updateOne(
          { _id: alert._id },
          { $unset: { pushSubscription: "" } }
        );
      }
    }
  } catch (err) {
    console.error("Job alert processing failed:", err);
  }
}
