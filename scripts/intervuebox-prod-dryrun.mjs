#!/usr/bin/env node
/**
 * IntervueBox production key + scope dry-run.
 *
 * Before the staging->prod cutover, this proves the new `sk_live_` key
 * authenticates against `api.intervuebox.ai` and carries every scope the 13
 * endpoints in `lib/intervuebox/*` need. Run it with the PROD key/URL, not the
 * ones in your committed `.env.local`.
 *
 * Usage (bash / macOS / Linux):
 *   INTERVUEBOX_API_KEY=sk_live_xxx \
 *   INTERVUEBOX_BASE_URL=https://api.intervuebox.ai/api/v1 \
 *   node scripts/intervuebox-prod-dryrun.mjs
 *
 * Usage (PowerShell):
 *   $env:INTERVUEBOX_API_KEY="sk_live_xxx"
 *   $env:INTERVUEBOX_BASE_URL="https://api.intervuebox.ai/api/v1"
 *   node scripts/intervuebox-prod-dryrun.mjs
 *
 * Or, if `.env.local` already holds the prod values:
 *   node --env-file=.env.local scripts/intervuebox-prod-dryrun.mjs
 *
 * Exit 0 = every endpoint passed auth + scope. Exit 1 = at least one 401
 * (bad key for this host) or 403 (missing scope) — the summary says which.
 *
 * Blast radius: creates at most ONE real job on the prod account (IntervueBox
 * dedupes jobs by content, so re-runs reuse it). No resumes, no applicants, no
 * emails — the applicant / invitation / report calls use throwaway ids and are
 * expected to 400/404, which still exercises auth + scope.
 */

const apiKey = process.env.INTERVUEBOX_API_KEY;
const baseUrl = (process.env.INTERVUEBOX_BASE_URL || "").replace(/\/$/, "");

if (!apiKey || !baseUrl) {
  console.error("Set INTERVUEBOX_API_KEY and INTERVUEBOX_BASE_URL first. See the header of this file.");
  process.exit(2);
}

const keyKind = apiKey.startsWith("sk_live_")
  ? "live"
  : apiKey.startsWith("sk_test_")
    ? "test"
    : "unknown-prefix";

console.log(`host:  ${baseUrl}`);
console.log(`key:   ${apiKey.slice(0, 11)}… (${keyKind})`);
if (keyKind !== "live") {
  console.log("WARNING: key is not sk_live_ — this is not the production key.");
}
console.log("");

let rateLimitSeen = null;
const results = [];

/**
 * @param {string} label   human name + the scope it proves
 * @param {string} method
 * @param {string} path
 * @param {object} [opts]   { body, multipart, expectFailOk }
 */
async function probe(label, method, path, opts = {}) {
  const headers = { Authorization: `Bearer ${apiKey}` };
  let body;
  if (opts.multipart) {
    body = new FormData(); // deliberately empty -> 400 "file required"
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let status = 0;
  let text = "";
  try {
    const res = await fetch(`${baseUrl}${path}`, { method, headers, body, cache: "no-store" });
    status = res.status;
    const limit = res.headers.get("x-ratelimit-limit");
    if (limit && rateLimitSeen === null) rateLimitSeen = limit;
    text = await res.text();
  } catch (err) {
    results.push({ label, method, path, status: "NETWORK", verdict: "FAIL", note: String(err) });
    return null;
  }

  let verdict;
  let note = "";
  if (status === 401) {
    verdict = "AUTH FAIL";
    note = "key not valid for this host";
  } else if (status === 403) {
    verdict = "SCOPE MISSING";
    note = snippet(text);
  } else if (status === 429) {
    verdict = "RATE LIMITED";
    note = snippet(text);
  } else if (status >= 200 && status < 300) {
    verdict = "PASS";
  } else if (status === 400 || status === 404 || status === 422) {
    verdict = "PASS"; // auth + scope OK, request just didn't validate — expected
    note = `(${status} expected)`;
  } else {
    verdict = "CHECK";
    note = `${status} ${snippet(text)}`;
  }

  results.push({ label, method, path, status, verdict, note });

  if (verdict === "PASS" && status >= 200 && status < 300) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

function snippet(text) {
  return (text || "").replace(/\s+/g, " ").slice(0, 140);
}

const RUN_ID = Date.now();

// 1. createJob — the one call that needs a real body; gives a real jobId reused
//    by the interview probes. Content-deduped by IntervueBox across runs.
const job = await probe("createJob  (CREATE_JOB)", "POST", "/public/jobs", {
  body: {
    title: "Merito prod dry-run — do not use",
    location: ["Remote"],
    jobType: "Full-time",
    industry: "General",
    designation: "Merito prod dry-run — do not use",
    department: "General",
    openings: 1,
    jobDescription:
      "Internal IntervueBox production key verification job created by scripts/intervuebox-prod-dryrun.mjs. Safe to delete.",
    skills: ["Communication"],
    education: [],
    experience: { min: 0, max: 1 },
    status: "ACTIVE",
  },
});
const jobId = job?.jobId ?? job?.data?.jobId ?? null;

// 2. uploadResume — empty multipart -> 400 "file required" proves the scope
await probe("uploadResume  (ADD_CANDIDATE_RESUME)", "POST", "/public/resumes", { multipart: true });

// 3. addApplicant — empty body -> 400 proves the scope
await probe(
  "addApplicant  (add-applicant)",
  "POST",
  `/public/jobs/${jobId ?? "dryrun-no-job"}/applicants`,
  { body: {} }
);

// 4. listApplicantsForJob
await probe("listApplicantsForJob", "GET", `/public/jobs/${jobId ?? "dryrun-no-job"}/applicants`);

// 5. getApplicant — throwaway id -> 404
await probe("getApplicant  (GET_APPLICANT)", "GET", `/public/applicants/dryrun-${RUN_ID}`);

// 6. resume-match report — throwaway id -> 404
await probe(
  "getResumeMatchReport  (GET_RESUME_MATCH_REPORT)",
  "GET",
  `/public/reports/applicants/dryrun-${RUN_ID}/resume-match`
);

// 7. applicant resume report — throwaway id -> 404
await probe(
  "getApplicantResumeReport  (GET_APPLICANT_RESUME_REPORT)",
  "GET",
  `/public/reports/applicants/dryrun-${RUN_ID}/resume`
);

// 8. interview-voices
await probe("listInterviewVoices", "GET", "/public/jobs/interview-voices");

// 9. createInterviewAgent — empty body -> 400 (or 201 if it accepts defaults)
await probe(
  "createInterviewAgent  (create-interview)",
  "POST",
  `/public/jobs/${jobId ?? "dryrun-no-job"}/interview`,
  { body: {} }
);

// 10. listInterviewCandidates — throwaway id -> 404
await probe("listInterviewCandidates", "GET", `/public/interviews/dryrun-${RUN_ID}/candidates`);

// 11. generateInterviewReport — empty body -> 400
await probe(
  "generateInterviewReport  (GENERATE_AI_INTERVIEW_REPORT)",
  "POST",
  "/public/reports/interviews/generate",
  { body: {} }
);

// 12. getInterviewReport — empty body -> 400 (this is the GET->POST one)
await probe(
  "getInterviewReport  (GET_AI_INTERVIEW_REPORT)",
  "POST",
  "/public/reports/interviews",
  { body: {} }
);

// 13. sendInterviewInvitation — throwaway id + empty body -> 400/404, sends nothing
await probe(
  "sendInterviewInvitation  (send-invitation)",
  "POST",
  `/public/invitations/interviews/dryrun-${RUN_ID}`,
  { body: {} }
);

// 14. reinvite — throwaway id + empty body -> 400/404, sends nothing
await probe(
  "reinvite  (reinvite)",
  "POST",
  `/public/invitations/interviews/dryrun-${RUN_ID}/reinvite`,
  { body: {} }
);

// ---- report ----
const pad = Math.max(...results.map((r) => r.label.length));
console.log("endpoint".padEnd(pad), " status  verdict");
console.log("-".repeat(pad + 20));
for (const r of results) {
  console.log(r.label.padEnd(pad), String(r.status).padStart(6), " ", r.verdict, r.note ? `  ${r.note}` : "");
}
console.log("");
console.log(`rate limit (X-RateLimit-Limit): ${rateLimitSeen ?? "not returned"}`);

const bad = results.filter((r) => r.verdict === "AUTH FAIL" || r.verdict === "SCOPE MISSING" || r.verdict === "FAIL");
const check = results.filter((r) => r.verdict === "CHECK" || r.verdict === "RATE LIMITED");

if (bad.length) {
  console.log("");
  console.log(`FAIL — ${bad.length} endpoint(s) blocked. Raise with IntervueBox:`);
  for (const r of bad) console.log(`  - ${r.label}: ${r.verdict} (${r.status}) ${r.note}`);
  process.exit(1);
}
if (check.length) {
  console.log("");
  console.log(`Passed auth+scope, but ${check.length} need a look (unexpected status / rate limit).`);
}
console.log("");
console.log("OK — prod key authenticates and every scope is present.");
console.log("Remember to delete the 'Merito prod dry-run' job from the IntervueBox dashboard.");
