"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/admin/_components/Button";
import ConfirmDialog from "@/app/admin/_components/ConfirmDialog";
import { useToast } from "@/app/admin/_components/Toast";

export default function ResumeMatchRetry({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function retry() {
    setConfirming(false);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/retry-resume-match`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast("error", data?.error || "Something went wrong, try again.");
        return;
      }
      showToast("success", "Retry requested.");
      router.refresh();
    } catch {
      showToast("error", "Something went wrong, try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={() => setConfirming(true)} disabled={busy} loading={busy}>
        Retry fitment scoring
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Retry fitment scoring?"
        message="Scores this resume against the job again. The current fitment result is replaced when the new one is ready."
        confirmLabel="Retry"
        busy={busy}
        onConfirm={retry}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
