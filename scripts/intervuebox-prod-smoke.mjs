#!/usr/bin/env node
/**
 * IntervueBox production resume-match smoke test.
 *
 * Runs the real resume-match chain against the prod account:
 *   createJob -> uploadResume -> addApplicant -> poll getResumeMatchReport
 * and prints the actual AI score. Proves the live backend works end-to-end
 * for the fitment-check path (the interview path still needs a human).
 *
 * Usage (bash):
 *   INTERVUEBOX_API_KEY=ib_live_xxx \
 *   INTERVUEBOX_BASE_URL=https://api.intervuebox.ai/api/v1 \
 *   node scripts/intervuebox-prod-smoke.mjs
 *
 * Creates ONE real job + ONE resume + ONE applicant on the prod account.
 * Prints the jobId at the end so you can delete it from the dashboard.
 */

const apiKey = process.env.INTERVUEBOX_API_KEY;
const baseUrl = (process.env.INTERVUEBOX_BASE_URL || "").replace(/\/$/, "");
if (!apiKey || !baseUrl) {
  console.error("Set INTERVUEBOX_API_KEY and INTERVUEBOX_BASE_URL.");
  process.exit(2);
}

const auth = { Authorization: `Bearer ${apiKey}` };

function log(...a) {
  console.log(...a);
}

async function json(path, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...auth, ...(init.headers || {}) } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${init?.method || "GET"} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return body;
}

/** Minimal single-page PDF with real, extractable resume text. */
function makeResumePdf() {
  const lines = [
    `ROSHAN KUMAR ${process.env.SMOKE_TAG || ""}`,
    `${SMOKE_EMAIL}  |  Bengaluru, India`,
    "",
    "SUMMARY",
    "Product manager with 4 years of experience shipping B2B SaaS.",
    "Owned roadmap, discovery, and analytics for a payments product.",
    "",
    "EXPERIENCE",
    "Senior Product Manager, Acme SaaS (2022-2026)",
    "- Led a 6-person squad; grew activation 18% via onboarding redesign.",
    "- Ran quarterly OKR planning and weekly experiment reviews.",
    "Product Analyst, Beta Corp (2020-2022)",
    "- Built the north-star metric framework and self-serve dashboards.",
    "",
    "SKILLS",
    "Product discovery, roadmapping, SQL, experimentation, stakeholder management.",
    "",
    "EDUCATION",
    "B.Tech, Computer Science, 2020.",
  ];
  const content =
    "BT /F1 11 Tf 54 780 Td 14 TL\n" +
    lines.map((l) => `(${l.replace(/([()\\])/g, "\\$1")}) Tj T*`).join("\n") +
    "\nET";

  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefPos = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const RUN = Date.now();
const started = Date.now();
const SMOKE_EMAIL = "roshanrk2014@gmail.com";
process.env.SMOKE_TAG = `REF${RUN}`;

log(`host: ${baseUrl}`);
log("");

// 1. createJob
const jd =
  "We are hiring a Senior Product Manager with 4+ years of experience in B2B SaaS. " +
  "You will own product discovery, the roadmap, experimentation, and analytics. " +
  "Strong SQL and stakeholder management required.";
const job = await json("/public/jobs", {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: `Merito prod smoke — Senior PM ${RUN}`,
    location: ["Remote"],
    jobType: "Full-time",
    industry: "Software",
    designation: "Senior Product Manager",
    department: "Product",
    openings: 1,
    jobDescription: jd,
    skills: ["Product discovery", "Roadmapping", "SQL", "Experimentation", "Stakeholder management"],
    education: [],
    experience: "4+ years",
    status: "ACTIVE",
  }),
});
const jobId = job.jobId || job.data?.jobId;
log(`1. createJob            -> jobId ${jobId}`);

// 2. uploadResume (multipart)
const fd = new FormData();
fd.set("file", new Blob([makeResumePdf()], { type: "application/pdf" }), `smoke-resume-${RUN}.pdf`);
fd.set("jobId", jobId);
const up = await json("/public/resumes", { method: "POST", headers: auth, body: fd });
const resumeId = up.resumeId || up.data?.resumeId;
log(`2. uploadResume         -> resumeId ${resumeId}`);

// 3. addApplicant — flat body, matching lib/intervuebox/applicants.ts.
//    Retry the "resume still parsing" race.
let appl;
for (let i = 0; i < 8; i++) {
  try {
    appl = await json(`/public/jobs/${jobId}/applicants`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId,
        name: "Roshan Kumar",
        email: SMOKE_EMAIL,
        phoneNumber: "+919999999999",
        currentCtc: "Not specified",
        expectedCtc: "Not specified",
        willingToRelocate: "Not specified",
        hearAboutUs: "Merito HUB",
        noticePeriod: "Not specified",
      }),
    });
    break;
  } catch (e) {
    const msg = String(e);
    if (/already applied/i.test(msg)) {
      log(`   addApplicant: already applied — recovering via listApplicantsForJob`);
      const list = await json(`/public/jobs/${jobId}/applicants`);
      const arr = list.applicants || list.data?.applicants || list.data || list;
      const mine = (Array.isArray(arr) ? arr : []).find((a) => (a.email || a.candidateEmail) === SMOKE_EMAIL) || arr?.[0];
      appl = { applicantId: mine?.applicantId || mine?.appliedJobId || mine?.id };
      break;
    }
    if (/parsing|not found|Invalid Resume/i.test(msg) && i < 7) {
      log(`   addApplicant retry ${i} (${msg.slice(60, 140)})`);
      await new Promise((s) => setTimeout(s, 4000));
      continue;
    }
    throw e;
  }
}
log(`3. addApplicant         -> ${JSON.stringify(appl).slice(0, 200)}`);
const appliedJobId = appl.applicantId || appl.data?.applicantId;
log(`   appliedJobId (applicantId): ${appliedJobId}`);

// 4. poll resume-match
log("4. getResumeMatchReport -> polling…");
let final;
for (let i = 0; i < 40; i++) {
  await new Promise((s) => setTimeout(s, 3000));
  let rep;
  try {
    rep = await json(`/public/reports/applicants/${appliedJobId}/resume-match`);
  } catch (e) {
    log(`   [${i}] ${String(e).slice(0, 120)}`);
    continue;
  }
  const status = rep.status || rep.data?.status;
  log(`   [${i}] status=${status}`);
  if (status && status !== "PENDING") {
    final = rep;
    break;
  }
}

log("");
if (!final) {
  log(`TIMED OUT after ${Math.round((Date.now() - started) / 1000)}s with no READY report.`);
  log(`jobId to delete: ${jobId}`);
  process.exit(1);
}

const rm = final.resumeMatch || final.data?.resumeMatch || final.data || final;
log(`READY in ${Math.round((Date.now() - started) / 1000)}s`);
log(`overallScore: ${rm.overallScore ?? rm.overall_score ?? "?"}`);
log(`strongPoints: ${JSON.stringify(rm.strongPoints ?? rm.strong_points ?? []).slice(0, 300)}`);
log(`weakPoints:   ${JSON.stringify(rm.weakPoints ?? rm.weak_points ?? []).slice(0, 300)}`);
log("");
log(`OK — prod IntervueBox produced a real resume-match score.`);
log(`Delete the smoke job from the dashboard: jobId ${jobId}`);
