// Demo mode lets a visitor explore the app as a customer or a banker without
// signing up. A demo session never talks to the auth/results backend: its token
// is a local marker rather than a JWT, and every analysis it produces is kept
// in localStorage. That keeps the demo working even when the database is
// unreachable, and keeps demo data out of real accounts.

import DEMO_APPLICANTS from "./demoApplicants";

const DEMO_TOKEN_PREFIX = "demo-session:";
const HISTORY_KEY = "demoAnalysisHistory";

export function isDemoSession() {
  const token = localStorage.getItem("token");
  return typeof token === "string" && token.startsWith(DEMO_TOKEN_PREFIX);
}

// A banker reviews a whole portfolio, a customer only ever sees their own
// application, so each persona starts from a differently shaped history.
function seedHistory(userType) {
  const now = Date.now();
  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

  if (userType === "banker") {
    return [
      {
        _id: "demo-portfolio-1",
        filename: "sample_loan_applications.csv",
        jsonData: DEMO_APPLICANTS,
        timestamp: daysAgo(2),
        isDemoSeed: true,
      },
    ];
  }

  // The customer persona is one applicant: a mid-range profile reads better as
  // a worked example than a best or worst case.
  const own = DEMO_APPLICANTS.find((a) => a.risk_category === "Medium Risk");
  return [
    {
      _id: "demo-application-1",
      filename: `credit_application_${own.applicant_id}.csv`,
      jsonData: [own],
      timestamp: daysAgo(1),
      isDemoSeed: true,
    },
  ];
}

export function startDemoSession(userType) {
  localStorage.setItem("token", `${DEMO_TOKEN_PREFIX}${userType}`);
  localStorage.setItem("userType", userType);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(seedHistory(userType)));

  // The chatbot reads the customer's latest analysis from this key.
  if (userType === "user") {
    const seeded = seedHistory(userType)[0];
    localStorage.setItem("userAnalysisData", JSON.stringify(seeded.jsonData));
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function clearDemoSession() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem("userAnalysisData");
}

export function getDemoHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDemoAnalysis(analysis) {
  const saved = {
    ...analysis,
    _id: `demo-${Date.now()}`,
    timestamp: analysis.timestamp || new Date().toISOString(),
  };
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([saved, ...getDemoHistory()])
  );
  return saved;
}

export function deleteDemoAnalysis(analysisId) {
  const remaining = getDemoHistory().filter(
    (item) => (item._id || item.id) !== analysisId
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));
}
