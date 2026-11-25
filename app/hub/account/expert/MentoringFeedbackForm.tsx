"use client";

import { useState } from "react";

// Shown under a completed mentoring session until the candidate rates it.
export default function MentoringFeedbackForm({ id, session }: { id: string; session: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Pick a rating from 1 to 5.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/hub/counselling/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      // 409 = already rated (e.g. another tab): the reload shows the saved rating either way.
      if (res.ok || res.status === 409) return window.location.reload();
      setError((await res.json().catch(() => null))?.error ?? "Something went wrong, try again.");
    } catch {
      setError("Something went wrong, try again.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <p id={`rate-${id}`} className="text-white" style={{ fontSize: 12.5, margin: 0 }}>
        How was session {session}?
      </p>
      <div role="group" aria-labelledby={`rate-${id}`} className="flex" style={{ gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={rating === n}
            aria-label={`${n} out of 5`}
            onClick={() => setRating(n)}
            className={rating === n ? "bg-[#ed1a24] text-white border-[#ed1a24]" : "bg-transparent text-white/70 border-white/[0.15] hover:border-white/40"}
            style={{ width: 36, height: 32, borderRadius: 8, borderWidth: 1, borderStyle: "solid", fontSize: 13, cursor: "pointer" }}
          >
            {n}
          </button>
        ))}
      </div>
      <label htmlFor={`comment-${id}`} className="text-white/55" style={{ fontSize: 12 }}>
        Anything to add? (optional)
      </label>
      <textarea
        id={`comment-${id}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={2}
        className="bg-transparent text-white border border-white/[0.15]"
        style={{ borderRadius: 8, padding: "8px 10px", fontSize: 12.5, resize: "vertical" }}
      />
      {error && (
        <p role="alert" className="text-[#ed1a24]" style={{ fontSize: 12, margin: 0 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60"
        style={{ alignSelf: "flex-start", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, cursor: "pointer" }}
      >
        {saving ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
