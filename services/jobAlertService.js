import Alert from "../models/Alert.js";
import { scoreAlertJobMatch } from "../utils/fuzzyMatcher.js";
import { sendJobAlertEmail } from "./sendJobAlertEmail.js";

const EMAIL_THRESHOLD = 6; // 🔥 important (tune later)

export const sendJobAlertToUsers = async (job) => {
  const alerts = await Alert.find({
    verified: true,
    deleted: false,
  });

  for (const alert of alerts) {
    const score = scoreAlertJobMatch(alert, job);

    if (score < EMAIL_THRESHOLD) continue;

    await sendJobAlertEmail({
      to: alert.email,
      name: alert.name || "there",
      job,
    });
  }
};
