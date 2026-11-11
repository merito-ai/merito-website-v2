"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/admin/_components/Button";
import { useToast } from "@/app/admin/_components/Toast";

const inputStyle = { fontSize: 13, padding: "8px 12px", border: "1px solid #dcdcdc", borderRadius: 7 } as const;

export default function AllowlistForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [emails, setEmails] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!emails.trim()) {
      showToast("error", "Paste at least one email.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/plan-allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, note }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast("error", data?.error || "Something went wrong. Try again.");
        return;
      }
      const invalid: string[] = data?.invalid ?? [];
      showToast("success", `Added ${data?.added ?? 0}${invalid.length ? ` · skipped invalid: ${invalid.join(", ")}` : ""}`);
      setEmails("");
      setNote("");
      router.refresh();
    } catch {
      showToast("error", "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-black/[0.08]" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, padding: 16, borderRadius: 14 }}>
      <textarea
        aria-label="Emails"
        placeholder="One email per line, or comma separated"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        rows={4}
        className="font-[family-name:var(--font-poppins)]"
        style={{ ...inputStyle, resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          aria-label="Note"
          placeholder="e.g. Pune seminar 2026-11"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          className="font-[family-name:var(--font-poppins)]"
          style={{ ...inputStyle, width: 260 }}
        />
        <Button onClick={submit} disabled={busy} loading={busy}>
          Add
        </Button>
      </div>
    </div>
  );
}
