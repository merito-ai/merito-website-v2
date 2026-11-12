"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlanState, isPlanOnly, freePlanReports } from "./usePlanState";
import { isSeminarUser } from "@/lib/firstVisit";
import { CHECK_FIT_LABEL } from "@/lib/planFeatures";

// firstRole: the user has no role yet (e.g. a plan bought before any fitment check), so there is no
// saved name/phone for rescore-role to reuse; ask for them here or the check fails with "Full name is required".
export default function ChangeRoleModal({
  onClose,
  onRoleChanged,
  firstRole = false,
}: {
  onClose: () => void;
  onRoleChanged: (roleTitle: string) => void;
  firstRole?: boolean;
}) {
  const router = useRouter();
  const { state: planState } = usePlanState();
  const freeReports = freePlanReports(planState, "report");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [candidateLevel, setCandidateLevel] = useState<"" | "entry" | "mid" | "senior">("");
  const [jdText, setJdText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = role.trim() && candidateLevel && jdText.trim() && cvFile && !busy && (!firstRole || (name.trim() && phone.trim()));

  const handleSubmit = async () => {
    if (!canSubmit || !cvFile) return;
    setBusy(true);
    setError(null);

    const form = new FormData();
    if (firstRole) {
      form.set("name", name.trim());
      form.set("phone", phone.trim());
    }
    form.set("role", role.trim());
    form.set("candidateLevel", candidateLevel);
    form.set("jdText", jdText.trim());
    form.set("cv", cvFile);
    form.set("recaptchaToken", ""); // rescore-role runs server-side for an already-authenticated user; recaptcha applies to the anonymous path it delegates to, which is conditional and skips cleanly when unconfigured

    try {
      const res = await fetch("/api/hub/rescore-role", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setBusy(false);
      onRoleChanged(role.trim());
      router.refresh();
    } catch {
      setBusy(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white"
        style={{ maxWidth: 480, width: "100%", borderRadius: 24, padding: 28, maxHeight: "92vh", overflowY: "auto" }}
      >
        <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 6px" }}>
          {firstRole ? "Check your first role" : "Change target role"}
        </h2>
        <p className="text-[#9c9c9c]" style={{ fontSize: 12.5, lineHeight: 1.6, margin: "0 0 18px" }}>
          {firstRole ? "Upload your CV and the job you want. " : "Your completed steps carry over. "}
          {freeReports > 0
            ? `The detailed report for the new role is included in your plan (${freeReports} left).`
            : isPlanOnly(planState)
              ? "The detailed report for the new role is included in Merito plans."
              : "The detailed report re-locks for the new role (₹299)."}
        </p>

        {firstRole && (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              aria-label="Your full name"
              autoComplete="name"
              className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24]"
              style={{ padding: "13px 14px", borderRadius: 8, fontSize: 14, marginBottom: 12 }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone, e.g. +91 98765 43210"
              aria-label="Phone number"
              type="tel"
              autoComplete="tel"
              className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24]"
              style={{ padding: "13px 14px", borderRadius: 8, fontSize: 14, marginBottom: 12 }}
            />
          </>
        )}
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior Product Manager"
          className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24]"
          style={{ padding: "13px 14px", borderRadius: 8, fontSize: 14, marginBottom: 4 }}
        />
        <p className="text-[#9c9c9c]" style={{ fontSize: 11, lineHeight: 1.4, margin: "0 0 12px" }}>
          This is the role your fitment score and report will be checked against.
        </p>

        <select
          value={candidateLevel}
          onChange={(e) => setCandidateLevel(e.target.value as "entry" | "mid" | "senior")}
          className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24]"
          style={{ padding: "13px 14px", borderRadius: 8, fontSize: 14, marginBottom: 12 }}
        >
          <option value="" disabled>
            Your experience level
          </option>
          <option value="entry">Entry-level (0-2 years)</option>
          <option value="mid">Mid-level (2-10 years)</option>
          <option value="senior">Senior-level (10+ years)</option>
        </select>

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24] resize-none"
          style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, height: 120, marginBottom: 12 }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white cursor-pointer flex items-center"
          style={{ border: `1.5px dashed ${cvFile ? "#22c55e" : "#dcdcdc"}`, borderRadius: 10, padding: "14px 16px", gap: 12, marginBottom: 16 }}
        >
          <span className="font-[family-name:var(--font-poppins)] font-semibold" style={{ fontSize: 13, color: cvFile ? "#16803c" : "#4b4b4d" }}>
            {cvFile ? `${cvFile.name} - ready ✓` : "Upload your CV (PDF or DOCX)"}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white"
          style={{ height: 48, borderRadius: 8, fontSize: 14, background: canSubmit ? "#ed1a24" : "#dcdcdc", border: "none", cursor: canSubmit ? "pointer" : "default" }}
        >
          {busy ? "Checking your fitment…" : isSeminarUser(planState) ? CHECK_FIT_LABEL : firstRole ? "Check my fitment" : "Re-evaluate my fitment"}
        </button>

        {error && <p style={{ fontSize: 12.5, color: "#ed1a24", marginTop: 10, textAlign: "center" }}>{error}</p>}
      </div>
    </div>
  );
}
