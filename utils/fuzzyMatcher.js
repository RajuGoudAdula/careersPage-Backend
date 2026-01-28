const SYNONYMS = {
    react: ["reactjs", "frontend", "ui"],
    node: ["nodejs", "express", "nestjs"],
    javascript: ["js"],
    backend: ["server", "api"],
    mongodb: ["mongo", "nosql"],
    bangalore: ["bengaluru", "blr"],
    fresher: ["junior", "entry", "0-1"],
  };
  
  function normalize(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function tokenize(text = "") {
    return normalize(text).split(" ").filter(Boolean);
  }
  
  function scoreText(text, tokens, baseScore) {
    let score = 0;
  
    for (const token of tokens) {
      if (text.includes(token)) score += baseScore;
  
      if (SYNONYMS[token]) {
        for (const syn of SYNONYMS[token]) {
          if (text.includes(syn)) score += baseScore - 1;
        }
      }
    }
  
    return score;
  }
  
  export function scoreAlertJobMatch(alert, job) {
    const title = normalize(job.title);
    const desc = normalize(job.description);
    const location = normalize(job.location);
  
    let score = 0;
  
    for (const k of alert.keywords) {
      const tokens = tokenize(k.value);
  
      if (k.type === "role") {
        score += scoreText(title, tokens, 5);
      }
  
      if (k.type === "tech") {
        score += scoreText(desc, tokens, 3);
      }
  
      if (k.type === "area") {
        score += scoreText(title, tokens, 2);
      }
    }
  
    // Location bonus
    if (
      alert.location &&
      location.includes(normalize(alert.location))
    ) {
      score += 2;
    }
  
    // Experience bonus
    if (
      alert.experience &&
      normalize(job.experience).includes(normalize(alert.experience))
    ) {
      score += 2;
    }
  
    return score;
  }
  