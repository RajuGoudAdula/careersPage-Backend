import cron from "node-cron";
import { processAlertEmails } from "../alerts/alert.email.processor.js";

// 🕘 Daily at 9 AM
cron.schedule("0 9 * * *", () => {
  processAlertEmails({ frequency: "daily", hours: 24 });
});

// 🕘 Weekly (Monday)
cron.schedule("0 9 * * 1", () => {
  processAlertEmails({ frequency: "weekly", hours: 168 });
});
