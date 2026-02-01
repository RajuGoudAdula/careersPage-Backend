import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendBrowserNotification(subscription, job) {
  if (!subscription) {
    console.warn("No push subscription found");
    return { success: false, reason: "NO_SUBSCRIPTION" };
  }

  // 🔒 Validate subscription shape
  if (
    !subscription.endpoint ||
    !subscription.keys?.p256dh ||
    !subscription.keys?.auth
  ) {
    console.error("Invalid push subscription format", subscription);
    return { success: false, reason: "INVALID_SUBSCRIPTION_FORMAT" };
  }

  const payload = JSON.stringify({
    title: `${job.company.companyName} is Hiring`,
    body: `New ${job.title} opening — apply now`,
    image: job.company.logo || "/images/job-banner.png", // large image (optional)
    
    data: {
      url: `${process.env.FRONTEND_URL}/jobs/${job._id}`, // where to open on click
      jobId: job._id,
      companyId: job.companyId,
    },
  
    actions: [
      { action: "view", title: "View Job" },
      { action: "save", title: "Save" }
    ],
  
    tag: `job-${job._id}`,       // prevents duplicate notifications
    renotify: true,              // notify again if same tag
    requireInteraction: true,    // stays until user interacts
    silent: false,               // play sound
    timestamp: Date.now(),
  });

  try {
    await webpush.sendNotification(subscription, payload, {
      TTL: 3600,
      urgency: "high",
    });

    // ✅ Log success
    console.log(`Push notification sent successfully for job: ${job.title} at ${job?.company?.companyName}`);

    return { success: true };
  } catch (err) {
    const statusCode = err?.statusCode;

    if (statusCode === 410 || statusCode === 404) {
      console.warn("Push subscription expired or invalid");
      return { success: false, reason: "INVALID_SUBSCRIPTION", shouldDelete: true };
    }

    if (statusCode === 401 || statusCode === 403) {
      console.error("VAPID or authorization error");
      return { success: false, reason: "AUTH_ERROR" };
    }

    console.error("Push failed:", err.message);
    return { success: false, reason: "UNKNOWN_ERROR", error: err.message };
  }
}
