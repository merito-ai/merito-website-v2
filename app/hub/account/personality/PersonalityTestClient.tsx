"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Play } from "lucide-react";
import {
  ITEMS,
  IMPRESSION_ITEMS,
  isCompleteAnswerSet,
  type Answers,
  type Scores,
  type Validity,
} from "@/lib/personality";
import { CULTURE_ITEMS } from "@/lib/psychometrics/cultureItems";
import type { CultureScores } from "@/lib/psychometrics/scoring";
import { initialPhase, type TestPhase } from "@/lib/psychometrics/testFlow";
import PersonalityReport from "./PersonalityReport";

const ALL = [...ITEMS, ...IMPRESSION_ITEMS];
const PER_PAGE = 13;
const SCALE_LABELS = ["Very inaccurate", "Moderately inaccurate", "Neither", "Moderately accurate", "Very accurate"];
const CULTURE_SCALE_LABELS = ["Strongly disagree", "Disagree", "Slightly disagree", "Neutral", "Slightly agree", "Agree", "Strongly agree"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type CultureResult = { scores: CultureScores | null; reliable: boolean | null };
type Result = { scores: Scores; validity: Validity; culture: CultureResult | null };

export default function PersonalityTestClient({
  roleTitle,
  candidateName,
  initialRow,
  initialResult,
  canRetakeV2,
}: {
  roleTitle: string;
  candidateName: string;
  initialRow: { version: number; culture_scores: unknown } | null;
  initialResult: Result | null;
  canRetakeV2: boolean;
}) {
  const [phase, setPhase] = useState<TestPhase>(() => (initialResult ? initialPhase(initialRow) : "intro"));
  const [result, setResult] = useState<Result | null>(initialResult);
  const [order] = useState(() => shuffle(ALL));
  const [cultureOrder] = useState(() => shuffle(CULTURE_ITEMS));
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [cultureAnswers, setCultureAnswers] = useState<Record<string, number>>({});
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCulture = phase === "culture-quiz";
  const items = useMemo(
    () =>
      isCulture
        ? cultureOrder.map((i) => ({ id: i.id, text: i.text }))
        : order.map((i) => ({ id: String(i.id), text: i.s })),
    [isCulture, cultureOrder, order]
  );
  const current: Record<string, number> = isCulture ? cultureAnswers : answers;
  const labels = isCulture ? CULTURE_SCALE_LABELS : SCALE_LABELS;
  const pages = Math.ceil(items.length / PER_PAGE);
  // 7 buttons must still fit a phone-width row, so the culture scale uses narrower buttons.
  const btnW = isCulture ? 34 : 48;
  const btnGap = isCulture ? 5 : 8;
  const pageItems = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const pageComplete = pageItems.every((it) => it.id in current);

  const setAnswer = (id: string, value: number) => {
    if (isCulture) setCultureAnswers((prev) => ({ ...prev, [id]: value }));
    else setAnswers((prev) => ({ ...prev, [Number(id)]: value }));
    setHint("");
  };

  const save = async (body: object): Promise<Record<string, unknown> | null> => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/save-personality-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return null;
      }
      return data;
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
      return null;
    }
  };

  const handleNext = async () => {
    if (!pageComplete) {
      setHint("Please answer every statement on this set before continuing.");
      return;
    }
    if (page < pages - 1) {
      setPage((p) => p + 1);
      window.scrollTo(0, 0);
      return;
    }
    if (isCulture) {
      if (Object.keys(cultureAnswers).length !== CULTURE_ITEMS.length) {
        setHint("Please answer every statement before seeing your results.");
        return;
      }
      const data = await save({ roleTitle, part: "culture", answers: cultureAnswers });
      if (!data) return;
      setResult((r) => (r ? { ...r, culture: data.culture as CultureResult } : r));
      setPhase("report");
      window.scrollTo(0, 0);
      return;
    }
    if (!isCompleteAnswerSet(answers)) {
      setHint("Please answer every statement before seeing your results.");
      return;
    }
    const data = await save({ roleTitle, part: "personality", answers });
    if (!data) return;
    setResult({ scores: data.scores as Scores, validity: data.validity as Validity, culture: null });
    setPage(0);
    setPhase("culture-intro");
    window.scrollTo(0, 0);
  };

  const startNewVersion = () => {
    setAnswers({});
    setCultureAnswers({});
    setPage(0);
    setPhase("intro");
    window.scrollTo(0, 0);
  };

  if (phase === "report" && result) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {canRetakeV2 && initialRow?.version === 1 && (
          <div style={{ background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)", borderRadius: 14, padding: 20 }}>
            <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 14, margin: "0 0 12px" }}>
              This is your earlier personality result. Your plan includes the new version: personality plus work-culture preferences.
            </p>
            <button
              onClick={startNewVersion}
              className="font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
              style={{ height: 42, padding: "0 20px", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}
            >
              Take the new test
            </button>
          </div>
        )}
        <PersonalityReport
          candidateName={candidateName}
          roleTitle={roleTitle}
          scores={result.scores}
          validity={result.validity}
          culture={result.culture}
        />
      </div>
    );
  }

  if (phase === "culture-intro") {
    return (
      <div style={{ background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)", borderRadius: 14, padding: 24 }}>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
          <ClipboardList size={20} strokeWidth={2} className="text-[#ed1a24]" />
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 15 }}>
            Part 2 of 2 &mdash; Work culture preferences
          </span>
        </div>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 20px" }}>
          {CULTURE_ITEMS.length} statements, about 6 minutes. Your Part 1 answers are saved. Rate how much you agree with
          each statement, from 1 (strongly disagree) to 7 (strongly agree).
        </p>
        <button
          onClick={() => {
            setPage(0);
            setPhase("culture-quiz");
            window.scrollTo(0, 0);
          }}
          className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
          style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer", boxShadow: "0 4px 6px rgba(236,34,40,0.3)" }}
        >
          <Play size={15} strokeWidth={2} fill="currentColor" />
          Start Part 2
        </button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div style={{ background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)", borderRadius: 14, padding: 24 }}>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
          <ClipboardList size={20} strokeWidth={2} className="text-[#ed1a24]" />
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 15 }}>
            Big Five (OCEAN) Personality Test
          </span>
        </div>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 16px" }}>
          A short questionnaire that maps how you tend to think, work and relate to others across five broad dimensions of personality &mdash; for {roleTitle}.
        </p>
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 20 }}>
          {["2 parts", `${ALL.length + CULTURE_ITEMS.length} statements`, "~17 minutes", "No right or wrong answers"].map((b) => (
            <span
              key={b}
              className="font-[family-name:var(--font-poppins)] text-white/55"
              style={{ fontSize: 11, borderRadius: 999, padding: "4px 12px", border: "1px solid rgb(49,47,55)" }}
            >
              {b}
            </span>
          ))}
        </div>
        <div className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 13, lineHeight: 1.65, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0 }}>Part 1 is about your personality, Part 2 about the work culture you prefer. Your progress is saved after Part 1.</p>
          <p style={{ margin: 0 }}>In Part 1, rate how accurately each statement describes you, from 1 (very inaccurate) to 5 (very accurate).</p>
          <p style={{ margin: 0 }}>Answer for how you actually are &mdash; not how you think you should be.</p>
          <p style={{ margin: 0 }}>Try not to sit on the fence: pick the side that fits you better.</p>
          <p style={{ margin: 0 }}>A few statements are worded in reverse, so read each one carefully.</p>
        </div>
        <button
          onClick={() => setPhase("quiz")}
          className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
          style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer", boxShadow: "0 4px 6px rgba(236,34,40,0.3)" }}
        >
          <Play size={15} strokeWidth={2} fill="currentColor" />
          Start test
        </button>
        <p className="text-white/35" style={{ fontSize: 12, marginTop: 14 }}>
          Your answers stay private and are only used to build your Merito profile.
        </p>
      </div>
    );
  }

  // phase === "quiz" | "culture-quiz"
  const qStart = page * PER_PAGE + 1;
  const qEnd = page * PER_PAGE + pageItems.length;
  return (
    <div>
      <div style={{ borderRadius: 14, padding: "20px 24px", background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white/55" style={{ fontSize: 13 }}>
            {isCulture ? "Part 2 of 2" : "Part 1 of 2"} &middot; Question {qStart}&ndash;{qEnd} of {items.length}
          </span>
          <div className="bg-white/[0.08] overflow-hidden" style={{ height: 6, width: 128, borderRadius: 999 }}>
            <div
              className="bg-[#ed1a24] h-full"
              style={{ borderRadius: 999, width: `${((page + 1) / pages) * 100}%`, transition: "width .25s ease" }}
            />
          </div>
        </div>

        <div
          className="hidden sm:flex font-[family-name:var(--font-poppins)] text-white/35"
          style={{ gap: btnGap, fontSize: 9, textAlign: "center", marginBottom: 6 }}
        >
          <div style={{ flex: 1 }} />
          {labels.map((l) => (
            <div key={l} style={{ width: btnW, lineHeight: 1.2 }}>
              {l}
            </div>
          ))}
        </div>

        <div>
          {pageItems.map((it, i) => {
            const qNum = page * PER_PAGE + i + 1;
            return (
              <div
                key={it.id}
                className="border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center"
                style={{ gap: 12, padding: "14px 0" }}
              >
                <p id={`q-${it.id}-label`} className="font-[family-name:var(--font-poppins)] text-white/85" style={{ fontSize: 14, margin: 0, flex: 1, minWidth: 0 }}>
                  <span className="font-semibold text-[#ed1a24]" style={{ marginRight: 6 }}>
                    {qNum}.
                  </span>
                  {it.text}
                </p>
                <div role="radiogroup" aria-labelledby={`q-${it.id}-label`} className="flex shrink-0" style={{ gap: btnGap }}>
                  {labels.map((label, idx) => {
                    const v = idx + 1;
                    const selected = current[it.id] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAnswer(it.id, v)}
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${v}: ${label}`}
                        className={
                          "font-[family-name:var(--font-poppins)] font-medium border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ed1a24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] " +
                          (selected
                            ? "border-[#ed1a24] bg-[#ed1a24]/15 text-[#ed1a24]"
                            : "border-white/[0.12] text-white/50 hover:border-[#ed1a24]/40")
                        }
                        style={{ width: btnW, height: 40, borderRadius: 8, fontSize: 14, cursor: "pointer" }}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {hint && (
          <p role="alert" style={{ color: "#E8798F", fontSize: 13, marginTop: 12 }}>
            {hint}
          </p>
        )}
        {error && (
          <p role="alert" style={{ color: "#E8798F", fontSize: 13, marginTop: 12 }}>
            {error}
          </p>
        )}

        <div className="flex items-center justify-between" style={{ marginTop: 22 }}>
          <button
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
              window.scrollTo(0, 0);
            }}
            disabled={page === 0}
            className="font-[family-name:var(--font-poppins)] font-medium text-white/50 hover:text-white transition-colors"
            style={{
              opacity: page === 0 ? 0 : 1,
              background: "none",
              border: "none",
              fontSize: 12,
              cursor: page === 0 ? "default" : "pointer",
            }}
          >
            &larr; Back
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className={
              "font-[family-name:var(--font-poppins)] font-semibold text-white transition-colors " +
              (saving ? "bg-white/[0.12]" : "bg-[#ed1a24] hover:bg-[#c8151e]")
            }
            style={{ height: 46, padding: "0 24px", borderRadius: 8, fontSize: 14, border: "none", cursor: saving ? "default" : "pointer", boxShadow: saving ? "none" : "0 4px 6px rgba(236,34,40,0.3)" }}
          >
            {saving ? "Saving…" : page !== pages - 1 ? "Next" : isCulture ? "Finish test" : "Save Part 1"}
          </button>
        </div>
      </div>
    </div>
  );
}
