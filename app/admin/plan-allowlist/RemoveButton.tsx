"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/admin/_components/Button";
import ConfirmDialog from "@/app/admin/_components/ConfirmDialog";
import { useToast } from "@/app/admin/_components/Toast";

export default function RemoveButton({ email }: { email: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/plan-allowlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast("error", data?.error || "Something went wrong. Try again.");
        return;
      }
      showToast("success", `Removed ${email}.`);
      router.refresh();
    } catch {
      showToast("error", "Something went wrong. Try again.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setConfirming(true)} disabled={busy}>
        Remove
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Remove email?"
        message={`Remove ${email}? Plans already bought are kept.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
