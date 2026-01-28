import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendBrowserNotification(subscription, job) {
  if (!subscription) return;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "New Job Match 🎯",
        body: job.title,
        url: job.link
      })
    );
  } catch (err) {
    console.error("Push failed:", err.message);
  }
}
