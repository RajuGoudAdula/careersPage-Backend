import Fuse from "fuse.js";
import { normalize } from "../utils/normalize.js";

export function isJobMatched(job, alert) {
  let score = 0;

  // 🔹 KEYWORDS (title + description)
  if (alert.keywords?.length) {
    const jobText = normalize(
      `${job.title} ${job.description}`
    );

    const fuse = new Fuse([jobText], {
      threshold: 0.4,
      ignoreLocation: true
    });

    let matched = 0;
    for (const k of alert.keywords) {
      if (fuse.search(normalize(k.value)).length) {
        matched++;
      }
    }

    score += (matched / alert.keywords.length) * 0.6;
  }

  // 🔹 LOCATION
  if (!alert.location) {
    score += 0.25;
  } else if (
    normalize(job.location).includes(normalize(alert.location))
  ) {
    score += 0.25;
  }

  // 🔹 EXPERIENCE (soft match)
  if (!alert.experience) {
    score += 0.15;
  } else if (job.experience === alert.experience) {
    score += 0.15;
  } else {
    score += 0.075;
  }
console.log(score);
  return score >= 0.6;
}
