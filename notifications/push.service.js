import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendBrowserNotification(subscription, job) {
  if (!subscription) {
    return { success: false, reason: "NO_SUBSCRIPTION" };
  }

  const payload = JSON.stringify({
    title: "New Job Match 🎯",
    body: job.title,
    url: job.link,
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (err) {
    const statusCode = err?.statusCode;

    // 🔥 Subscription is no longer valid → delete from DB
    if (statusCode === 410 || statusCode === 404) {
      console.warn("Push subscription expired or invalid");

      return {
        success: false,
        reason: "INVALID_SUBSCRIPTION",
        shouldDelete: true,
      };
    }

    // 🔐 Auth / VAPID issues
    if (statusCode === 401 || statusCode === 403) {
      console.error("VAPID or authorization error");

      return {
        success: false,
        reason: "AUTH_ERROR",
      };
    }

    // 🌐 Network / unknown error
    console.error("Push failed:", err.message);

    return {
      success: false,
      reason: "UNKNOWN_ERROR",
      error: err.message,
    };
  }
}
