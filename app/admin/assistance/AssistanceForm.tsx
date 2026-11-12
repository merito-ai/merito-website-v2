"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/admin/_components/Button";
import { useToast } from "@/app/admin/_components/Toast";
import { ASSISTANCE_LABEL, type AssistanceStatus } from "@/lib/planFeatures";

const field = { border: "1px solid #dcdcdc", borderRadius: 8, padding: "8px 10px", fontSize: 13, minHeight: 40, background: "#fff", color: "#000" } as const;

export default function AssistanceForm({ userId, email, status, companies }: { userId: string; email: string; status: AssistanceStatus; companies: string | null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [next, setNext] = useState(status);
  const [note, setNote] = useState(companies ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/assistance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: next, companies: note }),
      });
      const data = await response.json().catch(() => null);
      // A non-JSON 200 is requireAdmin's redirect to sign-in (expired session), not a success.
      if (!response.ok || !data) {
        showToast("error", data?.error || (response.ok ? "Your session expired. Reload and sign in again." : "Something went wrong. Try again."));
        return;
      }
      showToast("success", `Saved for ${email}.`);
      router.refresh();
    } catch {
      showToast("error", "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center font-[family-name:var(--font-poppins)]" style={{ gap: 8 }}>
      <label className="sr-only" htmlFor={`status-${userId}`}>Status for {email}</label>
      <select id={`status-${userId}`} value={next} onChange={(e) => setNext(e.target.value as AssistanceStatus)} style={field}>
        {(Object.keys(ASSISTANCE_LABEL) as AssistanceStatus[]).map((s) => (
          <option key={s} value={s}>{ASSISTANCE_LABEL[s]}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`companies-${userId}`}>The 3 companies for {email}</label>
      <input
        id={`companies-${userId}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="The 3 companies, notes"
        maxLength={2000}
        style={{ ...field, flex: "1 1 220px", minWidth: 0 }}
      />
      <Button onClick={save} loading={busy} disabled={next === status && note === (companies ?? "")}>
        Save
      </Button>
    </div>
  );
}
